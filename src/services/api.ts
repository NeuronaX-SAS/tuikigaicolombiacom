import { PreferenceRequest, PreferenceResponse } from './MercadoPagoService';
import { googleSheetsService, IkigaiResponse, PromoCodeRequest, PurchaseData } from './GoogleSheetsService';

/**
 * API para crear una preferencia de pago en Mercado Pago
 */
export async function createMercadoPagoPreference(request: PreferenceRequest): Promise<PreferenceResponse | null> {
  try {
    // Simulamos la creación de una preferencia para desarrollo
    console.log('Creando preferencia de pago:', request);
    
    // Simular un retraso de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockResponse: PreferenceResponse = {
      id: 'test_preference_' + Math.random().toString(36).substring(2, 15),
      init_point: 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=test_preference',
      sandbox_init_point: 'https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=test_preference',
      date_created: new Date().toISOString()
    };
    
    return mockResponse;
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    return null;
  }
}

/**
 * API Service - Servicio para manejar las llamadas a la API
 * 
 * Este servicio proporciona funciones para interactuar con la API del backend
 */

// URL del backend implementado con Google Apps Script
// En producción, reemplaza esta URL con la URL real de tu implementación
const BACKEND_URL = 'TU_URL_DE_BACKEND_AQUÍ';

/**
 * Guarda las respuestas del Ikigai en Google Sheets
 */
export async function saveIkigaiResponses(data: IkigaiResponse): Promise<boolean> {
  try {
    // En un entorno SSR, esta llamada iría directamente al backend
    // En un entorno de navegador, esta llamada pasará por el interceptor de API
    const response = await fetch('/api/save-ikigai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error al guardar respuestas: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error al guardar respuestas de Ikigai:', error);
    return false;
  }
}

/**
 * Guarda una solicitud de código promocional
 */
export async function savePromoCodeRequest(data: PromoCodeRequest): Promise<boolean> {
  try {
    const response = await fetch('/api/save-promo-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error al guardar código promocional: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error al guardar solicitud de código promocional:', error);
    return false;
  }
}

/**
 * Guarda los datos de una compra completada
 */
export async function savePurchaseData(data: PurchaseData): Promise<boolean> {
  try {
    const response = await fetch('/api/save-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error al guardar datos de compra: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error al guardar datos de compra:', error);
    return false;
  }
}

/**
 * Realiza una prueba de conectividad con el backend
 */
export async function testBackendConnection(): Promise<{connected: boolean, message: string}> {
  try {
    const response = await fetch('/api/test-connection', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        connected: false,
        message: `Error de conexión: ${response.status} ${response.statusText}`
      };
    }

    const result = await response.json();
    return {
      connected: true,
      message: result.message || 'Conexión exitosa'
    };
  } catch (error) {
    return {
      connected: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Compactar todas las APIs en un objeto
 */
export const API = {
  createMercadoPagoPreference,
  saveIkigaiResponses,
  savePromoCodeRequest,
  savePurchaseData,
  testBackendConnection
}; 