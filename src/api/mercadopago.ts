import type { PreferenceRequest, PreferenceResponse } from '../services/MercadoPagoService';

/**
 * API endpoint para crear una preferencia de Mercado Pago
 * Este archivo se ejecutará en el servidor (si se usa SSR)
 */
export async function createPreference(request: PreferenceRequest): Promise<PreferenceResponse> {
  try {
    const accessToken = 'APP_USR-240261110313946-042211-2ac5bcaa6657dc46979090e9bdc132c7-2375036063';
    
    // Asegurarse que los datos requeridos estén presentes
    if (!request.items || request.items.length === 0) {
      throw new Error('Se requiere al menos un ítem para crear la preferencia');
    }
    
    // Asegurarse que los back_urls estén presentes si no fueron proporcionados
    if (!request.back_urls) {
      // Evitamos usar window que podría no estar disponible en el servidor
      const origin = typeof location !== 'undefined' ? location.origin : 'https://tuikigai.com';
      
      request.back_urls = {
        success: `${origin}/payment/success`,
        failure: `${origin}/payment/failure`,
        pending: `${origin}/payment/pending`
      };
    }
    
    // Asegurarse que auto_return esté presente
    if (!request.auto_return) {
      request.auto_return = 'approved';
    }
    
    // Agregar datos adicionales de configuración para una mejor experiencia
    const preferenceData = {
      ...request,
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1
      },
      binary_mode: false,
      expires: false,
      statement_descriptor: 'TUIKIGAI',
      external_reference: request.external_reference
    };
    
    console.log('Creando preferencia con datos (incluyendo external_reference si existe):', JSON.stringify(preferenceData, null, 2));
    
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preferenceData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || response.statusText;
      } catch (e) {
        errorMessage = errorText || response.statusText;
      }
      console.error('Error de Mercado Pago:', errorMessage);
      throw new Error(`Error al crear preferencia: ${errorMessage}`);
    }
    
    const preferenceResponse = await response.json();
    console.log('Preferencia creada correctamente:', preferenceResponse.id);
    return preferenceResponse;
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    throw error;
  }
}

/**
 * API para obtener información de un pago
 */
export async function getPaymentInfo(paymentId: string) {
  try {
    const accessToken = 'APP_USR-240261110313946-042211-2ac5bcaa6657dc46979090e9bdc132c7-2375036063';
    
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || response.statusText;
      } catch (e) {
        errorMessage = errorText || response.statusText;
      }
      console.error('Error al obtener información del pago:', errorMessage);
      throw new Error(`Error al obtener información del pago: ${errorMessage}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al obtener información del pago:', error);
    throw error;
  }
}