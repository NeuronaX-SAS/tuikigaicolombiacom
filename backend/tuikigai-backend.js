/**
 * TUIKIGAI - Backend con Google Apps Script
 * 
 * Este script maneja las operaciones de backend para la aplicación TUIKIGAI
 * Incluye integración con Siigo para facturación electrónica y gestión de datos en Google Sheets
 * 
 * CONFIGURACIÓN:
 * 1. Crear una nueva hoja de cálculo de Google Sheets
 * 2. Crear las hojas: "Submissions", "GiftCodes", "Transactions"
 * 3. Agregar encabezados a cada hoja según la estructura de datos esperada
 * 4. Abrir el editor de secuencias de comandos (Herramientas > Editor de secuencias de comandos)
 * 5. Copiar este código y guardar
 * 6. Implementar como aplicación web (Implementar > Nueva implementación > Aplicación web)
 * 7. Configurar para que se ejecute como "Yo" y acceso "Cualquier persona"
 * 8. Guardar la URL de la aplicación web para usar en el frontend
 */

// ID de la hoja de cálculo donde se almacenan los datos
// IMPORTANTE: Reemplazar con el ID real de tu hoja de cálculo
const SPREADSHEET_ID = 'TU_ID_DE_SPREADSHEET';

// Credenciales de Siigo (API de facturación electrónica colombiana)
// IMPORTANTE: Obtener estas credenciales del portal de desarrolladores de Siigo
// https://developers.siigo.com/
// WARNING: Never hardcode real credentials in this file. Use environment variables or secret managers for production deployments.
// Example (pseudo-code):
// const SIIGO_API = {
//   URL: process.env.SIIGO_URL,
//   USERNAME: process.env.SIIGO_USERNAME,
//   PASSWORD: process.env.SIIGO_PASSWORD,
//   SUBSCRIPTION_KEY: process.env.SIIGO_SUBSCRIPTION_KEY
// };
const SIIGO_API = {
  URL: 'https://api.siigo.com/',
  USERNAME: 'TU_USUARIO_SIIGO',
  PASSWORD: 'TU_CONTRASEÑA_SIIGO',
  SUBSCRIPTION_KEY: 'TU_SUBSCRIPTION_KEY'
};

// Precios de los productos (en COP)
const PRICES = {
  SELF: 99000,  // Compra para uno mismo
  GIFT: 109000  // Regalo para otra persona
};

// ID de producto en Siigo
// IMPORTANTE: Crear estos productos en el panel de Siigo y obtener sus IDs
const SIIGO_PRODUCT_IDS = {
  SELF: 'ID_PRODUCTO_SELF',
  GIFT: 'ID_PRODUCTO_GIFT'
};

// URL de redirección después del pago
// IMPORTANTE: Actualizar con la URL real de tu aplicación
const REDIRECT_URLS = {
  SUCCESS: 'https://tuikigai.co/payment-success',
  CANCEL: 'https://tuikigai.co/payment-cancelled'
};

/**
 * Punto de entrada para solicitudes web
 * Maneja las diferentes acciones según el parámetro 'action'
 */
function doPost(e) {
  const params = e.parameter;
  const action = params.action;
  
  // Configurar CORS para permitir solicitudes desde el dominio de la aplicación
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Añadir headers CORS
  // output.setHeader('Access-Control-Allow-Origin', '*');
  output.setHeader('Access-Control-Allow-Origin', 'https://tuikigai.co');
  output.setHeader('Vary', 'Origin');
  
  try {
    let result;
    
    // Ejecutar la acción correspondiente
    switch (action) {
      case 'submit':
        result = handleSubmission(params);
        break;
      case 'verify':
        result = verifyTransaction(params);
        break;
      case 'redeem':
        result = redeemGiftCode(params);
        break;
      default:
        throw new Error('Acción no válida');
    }
    
    // Devolver resultado exitoso
    output.setContent(JSON.stringify({
      success: true,
      data: result
    }));
    
  } catch (error) {
    // Devolver error
    output.setContent(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
  
  return output;
}

/**
 * Maneja la solicitud de compra o canje
 * @param {Object} params - Parámetros de la solicitud
 * @return {Object} Datos de respuesta incluyendo URL de pago si aplica
 */
function handleSubmission(params) {
  const type = params.type; // 'self', 'gift', o 'redeem'
  const timestamp = new Date();
  
  // Validar parámetros obligatorios
  if (!params.buyerName || !params.buyerEmail) {
    throw new Error('Nombre y correo electrónico son obligatorios');
  }
  
  // Validar formato de correo electrónico
  if (!validateEmail(params.buyerEmail)) {
    throw new Error('Formato de correo electrónico inválido');
  }
  
  // Guardar datos en la hoja de cálculo
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Submissions');
  
  // Datos comunes para todos los tipos
  const commonData = [
    timestamp.toISOString(),
    getClientIp(params),
    params.userAgent || '',
    type,
    params.buyerName,
    params.buyerEmail,
    params.ikigaiLove || '',
    params.ikigaiTalent || '',
    params.ikigaiNeed || '',
    params.ikigaiPayment || '',
    params.consentAccepted === 'true' ? 'Sí' : 'No'
  ];
  
  let paymentUrl = '';
  let transactionId = '';
  let giftCode = '';
  
  // Procesar según el tipo de experiencia
  if (type === 'redeem') {
    // Validar código de regalo
    if (!params.giftCode) {
      throw new Error('Código de regalo no proporcionado');
    }
    
    const validationResult = validateGiftCode(params.giftCode);
    if (!validationResult.valid) {
      throw new Error(validationResult.message);
    }
    
    // Marcar código como utilizado
    markGiftCodeAsUsed(params.giftCode, params.buyerEmail);
    
    // Añadir datos específicos de redención
    sheet.appendRow([...commonData, params.giftCode, '', '', 'Canjeado', '', '']);
    
    return {
      message: 'Código canjeado exitosamente',
      redirectUrl: '/ikigai-results'
    };
    
  } else {
    // Generar transacción en Siigo para compra propia o regalo
    const siigoData = generateSiigoTransaction(params);
    paymentUrl = siigoData.paymentUrl;
    transactionId = siigoData.transactionId;
    
    if (type === 'gift') {
      // Validar datos del destinatario
      if (!params.recipientName || !params.recipientEmail) {
        throw new Error('Nombre y correo electrónico del destinatario son obligatorios');
      }
      
      if (!validateEmail(params.recipientEmail)) {
        throw new Error('Formato de correo electrónico del destinatario inválido');
      }
      
      // Generar código de regalo único
      giftCode = generateGiftCode();
      
      // Guardar código en la hoja de códigos de regalo
      const giftSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('GiftCodes');
      giftSheet.appendRow([
        timestamp.toISOString(),
        giftCode,
        params.buyerName,
        params.buyerEmail,
        params.recipientName,
        params.recipientEmail,
        'Generado',
        ''
      ]);
      
      // Añadir datos específicos de regalo
      sheet.appendRow([
        ...commonData,
        params.buyerTaxId || '',
        params.buyerAddress || '',
        params.recipientName,
        params.recipientEmail,
        giftCode,
        PRICES.GIFT,
        'Pendiente',
        transactionId,
        paymentUrl
      ]);
      
    } else { // type === 'self'
      // Añadir datos específicos de compra propia
      sheet.appendRow([
        ...commonData,
        params.buyerTaxId || '',
        params.buyerAddress || '',
        '', // recipientName
        '', // recipientEmail
        '', // giftCode
        PRICES.SELF,
        'Pendiente',
        transactionId,
        paymentUrl
      ]);
    }
    
    return {
      paymentUrl: paymentUrl,
      transactionId: transactionId,
      giftCode: giftCode
    };
  }
}

/**
 * Verifica el estado de una transacción en Siigo
 * @param {Object} params - Parámetros con el ID de transacción
 * @return {Object} Estado de la transacción
 */
function verifyTransaction(params) {
  const transactionId = params.transactionId;
  
  if (!transactionId) {
    throw new Error('ID de transacción no proporcionado');
  }
  
  // Obtener token de autenticación para Siigo
  const token = getSiigoToken();
  
  try {
    // Consultar estado de la transacción
    const response = UrlFetchApp.fetch(`${SIIGO_API.URL}v1/Invoice/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': SIIGO_API.SUBSCRIPTION_KEY
      }
    });
    
    const responseData = JSON.parse(response.getContentText());
    
    // Actualizar estado en la hoja de cálculo
    if (responseData.status === 'Paid') {
      updateTransactionStatus(transactionId, 'Pagado');
      
      // Enviar correo de confirmación
      sendConfirmationEmail(transactionId);
      
      return {
        status: 'Pagado',
        message: 'Pago procesado exitosamente'
      };
    } else {
      return {
        status: responseData.status,
        message: 'Transacción en proceso'
      };
    }
  } catch (error) {
    console.error('Error al verificar transacción:', error);
    return {
      status: 'Error',
      message: 'No se pudo verificar el estado de la transacción'
    };
  }
}

/**
 * Valida un código de regalo
 * @param {string} code - Código de regalo a validar
 * @return {Object} Resultado de la validación
 */
function validateGiftCode(code) {
  if (!code) {
    return { valid: false, message: 'Código de regalo no proporcionado' };
  }
  
  if (!code.startsWith('TKG-')) {
    return { valid: false, message: 'Formato de código inválido. Debe comenzar con TKG-' };
  }
  
  // Buscar el código en la hoja de códigos de regalo
  const giftSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('GiftCodes');
  const dataRange = giftSheet.getDataRange();
  const values = dataRange.getValues();
  
  // Buscar el código (omitir la fila de encabezados)
  for (let i = 1; i < values.length; i++) {
    if (values[i][1] === code) {
      // Verificar si ya ha sido canjeado
      if (values[i][6] === 'Canjeado') {
        return { valid: false, message: 'Este código ya ha sido canjeado' };
      }
      
      return { valid: true, message: 'Código válido' };
    }
  }
  
  return { valid: false, message: 'Código de regalo no encontrado' };
}

/**
 * Marca un código de regalo como utilizado
 * @param {string} code - Código de regalo
 * @param {string} userEmail - Correo electrónico del usuario que canjea
 */
function markGiftCodeAsUsed(code, userEmail) {
  const giftSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('GiftCodes');
  const dataRange = giftSheet.getDataRange();
  const values = dataRange.getValues();
  
  // Buscar el código y actualizar su estado
  for (let i = 1; i < values.length; i++) {
    if (values[i][1] === code) {
      giftSheet.getRange(i + 1, 7).setValue('Canjeado');
      giftSheet.getRange(i + 1, 8).setValue(userEmail);
      giftSheet.getRange(i + 1, 9).setValue(new Date().toISOString());
      break;
    }
  }
}

/**
 * Genera un código de regalo único
 * @return {string} Código generado
 */
function generateGiftCode() {
  const timestamp = new Date().getTime().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `TKG-${timestamp.substring(timestamp.length - 3)}${randomPart}`;
}

/**
 * Valida formato de correo electrónico
 * @param {string} email - Correo a validar
 * @return {boolean} Resultado de validación
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Obtiene la dirección IP del cliente
 * @param {Object} params - Parámetros de la solicitud
 * @return {string} Dirección IP
 */
function getClientIp(params) {
  return params.ip || '';
}

/**
 * Genera una transacción en Siigo Checkout
 * @param {Object} params - Datos para la transacción
 * @return {Object} Datos de la transacción creada
 */
function generateSiigoTransaction(params) {
  // Obtener token de autenticación
  const token = getSiigoToken();
  
  // Determinar producto según el tipo de compra
  const productId = params.type === 'gift' ? SIIGO_PRODUCT_IDS.GIFT : SIIGO_PRODUCT_IDS.SELF;
  const amount = params.type === 'gift' ? PRICES.GIFT : PRICES.SELF;
  const description = params.type === 'gift' ? 'Regalo Experiencia TUIKIGAI' : 'Experiencia TUIKIGAI Personal';
  
  // Preparar datos de la transacción
  const transactionData = {
    document: {
      documentType: {
        code: "FV" // Factura de venta
      },
      customer: {
        name: params.buyerName,
        email: params.buyerEmail,
        identification: params.buyerTaxId || '',
        address: {
          address: params.buyerAddress || '',
          city: {
            countryCode: "CO",
            stateCode: "11",
            cityCode: "11001"
          }
        }
      },
      seller: {
        identification: "1000000000", // ID del vendedor en Siigo
        name: "Vendedor TUIKIGAI"
      },
      items: [
        {
          productId: productId,
          description: description,
          quantity: 1,
          price: amount,
          taxed: true
        }
      ],
      payments: [
        {
          paymentId: 5636, // ID del método de pago "Tarjeta de crédito" en Siigo
          value: amount
        }
      ]
    },
    redirectUrls: {
      successUrl: REDIRECT_URLS.SUCCESS,
      cancelUrl: REDIRECT_URLS.CANCEL
    }
  };
  
  try {
    // Crear factura y obtener URL de pago
    const response = UrlFetchApp.fetch(`${SIIGO_API.URL}v1/Invoice/checkout`, {
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Ocp-Apim-Subscription-Key': SIIGO_API.SUBSCRIPTION_KEY
      },
      payload: JSON.stringify(transactionData)
    });
    
    const responseData = JSON.parse(response.getContentText());
    
    return {
      transactionId: responseData.document.id,
      paymentUrl: responseData.checkoutUrl
    };
  } catch (error) {
    console.error('Error al generar transacción en Siigo:', error);
    throw new Error('No se pudo generar la transacción de pago');
  }
}

/**
 * Obtiene token de autenticación para API de Siigo
 * @return {string} Token de autenticación
 */
function getSiigoToken() {
  try {
    const response = UrlFetchApp.fetch(`${SIIGO_API.URL}auth`, {
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Ocp-Apim-Subscription-Key': SIIGO_API.SUBSCRIPTION_KEY
      },
      payload: JSON.stringify({
        username: SIIGO_API.USERNAME,
        password: SIIGO_API.PASSWORD
      })
    });
    
    const responseData = JSON.parse(response.getContentText());
    return responseData.access_token;
  } catch (error) {
    console.error('Error al obtener token de Siigo:', error);
    throw new Error('Error de autenticación con Siigo');
  }
}

/**
 * Actualiza el estado de una transacción en la hoja de cálculo
 * @param {string} transactionId - ID de la transacción
 * @param {string} status - Nuevo estado
 */
function updateTransactionStatus(transactionId, status) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Submissions');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Buscar la transacción y actualizar su estado
  for (let i = 1; i < values.length; i++) {
    if (values[i][17] === transactionId) { // columna 18 (índice 17) para transactionId
      sheet.getRange(i + 1, 17).setValue(status); // columna 17 (índice 16) para Estado
      sheet.getRange(i + 1, 19).setValue(new Date().toISOString()); // Fecha de pago
      break;
    }
  }
}

/**
 * Envía un correo de confirmación al comprador
 * @param {string} transactionId - ID de la transacción
 */
function sendConfirmationEmail(transactionId) {
  try {
    // Buscar la transacción
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Submissions');
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let transactionData = null;
    
    // Encontrar la fila correspondiente a la transacción
    for (let i = 1; i < values.length; i++) {
      if (values[i][17] === transactionId) { // columna 18 (índice 17) para transactionId
        transactionData = {
          type: values[i][3], // tipo de experiencia
          buyerName: values[i][4],
          buyerEmail: values[i][5],
          recipientName: values[i][12],
          recipientEmail: values[i][13],
          giftCode: values[i][14]
        };
        break;
      }
    }
    
    if (!transactionData) {
      console.error('No se encontró la transacción para enviar el correo');
      return;
    }
    
    // Enviar correo según el tipo de experiencia
    if (transactionData.type === 'gift') {
      // Enviar correo al comprador
      MailApp.sendEmail({
        to: transactionData.buyerEmail,
        subject: '¡Gracias por tu compra en TUIKIGAI!',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B6B;">¡Gracias por tu compra!</h1>
            <p>Hola ${transactionData.buyerName},</p>
            <p>Tu pago ha sido procesado exitosamente. Has regalado una experiencia TUIKIGAI a ${transactionData.recipientName}.</p>
            <p>El código de regalo es: <strong>${transactionData.giftCode}</strong></p>
            <p>Hemos enviado un correo a ${transactionData.recipientEmail} con las instrucciones para canjear el código.</p>
            <p>¡Gracias por compartir el poder del propósito!</p>
            <p>Equipo TUIKIGAI</p>
          </div>
        `
      });
      
      // Enviar correo al destinatario del regalo
      sendGiftEmail(transactionData.recipientName, transactionData.recipientEmail, transactionData.giftCode);
      
    } else { // type === 'self'
      MailApp.sendEmail({
        to: transactionData.buyerEmail,
        subject: '¡Gracias por tu compra en TUIKIGAI!',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B6B;">¡Gracias por tu compra!</h1>
            <p>Hola ${transactionData.buyerName},</p>
            <p>Tu pago ha sido procesado exitosamente. Ahora podrás explorar tu Ikigai personal.</p>
            <p>Nuestro equipo está trabajando en tu diagrama Ikigai personalizado y te contactaremos pronto con los resultados.</p>
            <p>Mientras tanto, puedes seguir explorando y refinando tus respuestas en la plataforma.</p>
            <p>¡Gracias por embarcarte en este viaje de autodescubrimiento!</p>
            <p>Equipo TUIKIGAI</p>
          </div>
        `
      });
    }
  } catch (error) {
    console.error('Error al enviar correo de confirmación:', error);
  }
}

/**
 * Envía un correo con un código de regalo
 * @param {string} recipientName - Nombre del destinatario
 * @param {string} recipientEmail - Correo del destinatario
 * @param {string} giftCode - Código de regalo
 */
function sendGiftEmail(recipientName, recipientEmail, giftCode) {
  try {
    MailApp.sendEmail({
      to: recipientEmail,
      subject: '¡Te han regalado una experiencia TUIKIGAI!',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6B6B;">¡Te han regalado una experiencia TUIKIGAI!</h1>
          <p>Hola ${recipientName},</p>
          <p>Alguien especial te ha regalado una experiencia TUIKIGAI para descubrir tu propósito de vida a través del concepto japonés del Ikigai.</p>
          <p>Tu código de regalo es: <strong>${giftCode}</strong></p>
          <p>Para canjear tu regalo, visita <a href="https://tuikigai.co/redeem">nuestra página de canje</a> e ingresa el código.</p>
          <p>Esta experiencia te guiará a través de un proceso de autodescubrimiento para encontrar el equilibrio entre lo que amas, en lo que eres bueno, lo que el mundo necesita y por lo que te pagarían.</p>
          <p>¡Esperamos que disfrutes este viaje de autodescubrimiento!</p>
          <p>Equipo TUIKIGAI</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error al enviar correo de regalo:', error);
  }
}

/**
 * Función para probar el backend (solo para desarrollo)
 * Esta función puede ser ejecutada manualmente para verificar el funcionamiento
 */
function testBackend() {
  // Ejemplo de datos para una compra para sí mismo
  const selfPurchaseParams = {
    action: 'submit',
    type: 'self',
    buyerName: 'Usuario Prueba',
    buyerEmail: 'test@example.com',
    buyerTaxId: '1234567890',
    buyerAddress: 'Calle Falsa 123, Bogotá',
    ikigaiLove: 'Me encanta programar',
    ikigaiTalent: 'Soy bueno explicando conceptos técnicos',
    ikigaiNeed: 'El mundo necesita educación en tecnología',
    ikigaiPayment: 'Me pagarían por desarrollar software educativo',
    consentAccepted: 'true'
  };
  
  // Simular una solicitud POST
  const mockEvent = {
    parameter: selfPurchaseParams
  };
  
  // Ejecutar la función doPost
  const result = doPost(mockEvent);
  
  // Mostrar resultado
  console.log(result.getContent());
}

// Agregar función para manejar solicitudes GET para probar que el servicio está funcionando
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "TUIKIGAI API está funcionando correctamente"
  })).setMimeType(ContentService.MimeType.JSON);
}