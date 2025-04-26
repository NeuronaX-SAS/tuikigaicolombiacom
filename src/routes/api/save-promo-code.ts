import { RequestHandler } from '@builder.io/qwik-city';
import axios from 'axios';
import type { PromoCodeRequest } from '../../services/GoogleSheetsService';

// URL de la API de Google Sheets (implementada con Google Apps Script)
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzGZXHP9PkeVOjpiJhqeiiADZKsrIaFkQ6VLcrlzkTQ-BTSXUP-tzoRDFhitzIda-Wg/exec';

// Códigos promocionales válidos
const VALID_PROMO_CODES = ['IKIGAI2023', 'TUIKI2023', 'PROMO50'];

/**
 * Endpoint para validar y registrar códigos promocionales
 */
export const onPost: RequestHandler = async (requestEvent) => {
  try {
    // Parsear los datos del request
    const data = await requestEvent.parseBody() as PromoCodeRequest;
    
    // Validar que existen los datos requeridos
    if (!data || !data.email || !data.promoCode) {
      requestEvent.json(400, { 
        error: 'Datos incompletos o inválidos'
      });
      return;
    }

    // Registrar los datos recibidos en consola
    console.log('🟢 [API /api/save-promo-code] Datos recibidos:', JSON.stringify(data));
    
    // Validar el código promocional
    const isValidCode = VALID_PROMO_CODES.includes(data.promoCode.toUpperCase());
    if (!isValidCode) {
      requestEvent.json(400, { 
        error: 'Código promocional inválido o expirado'
      });
      return;
    }
    
    try {
      console.log('🔵 [API /api/save-promo-code] Enviando datos a Google Apps Script URL:', SHEETS_API_URL);
      
      // Enviar datos a Google Sheets a través del Apps Script
      const response = await axios.post(SHEETS_API_URL, {
        action: 'savePromoCode',
        data: data
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🟢 [API /api/save-promo-code] Respuesta de Google Sheets:', 
                  response.status, response.statusText, JSON.stringify(response.data));
      
      if (response.data && response.data.success) {
        // Éxito al guardar en Google Sheets
        requestEvent.json(200, { 
          success: true,
          message: 'Código promocional validado correctamente',
          orderNumber: `TI-PROMO-${Math.floor(Math.random() * 100000)}`
        });
      } else {
        console.error('🔴 [API /api/save-promo-code] Error en Apps Script:', 
                    response.data ? response.data.error : 'Sin mensaje de error');
        throw new Error(`Error al guardar en Google Sheets: ${response.data?.error || 'Error desconocido'}`);
      }
    } catch (error: any) {
      console.error('🔴 [API /api/save-promo-code] Error enviando datos a Google Sheets:');
      if (error.response) {
        console.error('   Respuesta de error:', error.response.status, error.response.statusText);
        console.error('   Datos de error:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('   No se recibió respuesta. Request:', error.request);
      } else {
        console.error('   Error de configuración:', error.message);
      }
      console.error('   Config:', JSON.stringify(error.config || {}));
      
      // Si Google Sheets falla, devolvemos éxito para no bloquear la experiencia (opcional)
      requestEvent.json(200, { 
        success: true,
        message: 'Código promocional validado correctamente (modo alternativo)',
        orderNumber: `TI-PROMO-${Math.floor(Math.random() * 100000)}`
      });
    }
  } catch (error: any) {
    console.error('🔴 [API /api/save-promo-code] Error en el endpoint:', error);
    requestEvent.json(500, { 
      error: 'Error interno al procesar la solicitud: ' + (error.message || 'Unknown error')
    });
  }
};