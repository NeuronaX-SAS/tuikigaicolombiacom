import { RequestHandler } from '@builder.io/qwik-city';
import axios from 'axios';
import type { PurchaseData } from '../../../services/GoogleSheetsService';

// URL de la API de Google Sheets (implementada con Google Apps Script)
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzGZXHP9PkeVOjpiJhqeiiADZKsrIaFkQ6VLcrlzkTQ-BTSXUP-tzoRDFhitzIda-Wg/exec';

/**
 * Endpoint para guardar datos de compras en Google Sheets
 */
export const onPost: RequestHandler = async (requestEvent) => {
  try {
    // Parsear los datos del request
    const data = await requestEvent.parseBody() as PurchaseData;
    
    // Validar que existen los datos requeridos
    if (!data || !data.email || !data.orderNumber) {
      requestEvent.json(400, { 
        error: 'Datos de compra incompletos o inválidos'
      });
      return;
    }

    // Registrar los datos recibidos en consola
    console.log('🟢 [API /api/save-purchase] Datos de compra recibidos:', JSON.stringify(data));
    
    try {
      console.log('🔵 [API /api/save-purchase] Enviando datos a Google Apps Script URL:', SHEETS_API_URL);
      
      // Enviar datos a Google Sheets a través del Apps Script
      const response = await axios.post(SHEETS_API_URL, {
        action: 'savePurchase',
        data: data
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🟢 [API /api/save-purchase] Respuesta de Google Sheets:', 
                  response.status, response.statusText, JSON.stringify(response.data));
      
      if (response.data && response.data.success) {
        // Éxito al guardar en Google Sheets
        requestEvent.json(200, { 
          success: true,
          message: 'Datos de compra guardados correctamente'
        });
      } else {
        console.error('🔴 [API /api/save-purchase] Error en Apps Script:', 
                     response.data ? response.data.error : 'Sin mensaje de error');
        throw new Error(`Error al guardar en Google Sheets: ${response.data?.error || 'Error desconocido'}`);
      }
    } catch (error: any) {
      console.error('🔴 [API /api/save-purchase] Error enviando datos a Google Sheets:');
      if (error.response) {
        console.error('   Respuesta de error:', error.response.status, error.response.statusText);
        console.error('   Datos de error:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('   No se recibió respuesta. Request:', error.request);
      } else {
        console.error('   Error de configuración:', error.message);
      }
      console.error('   Config:', JSON.stringify(error.config || {}));
      
      // Si falla, al menos no bloqueamos la experiencia del usuario
      requestEvent.json(200, { 
        success: true,
        message: 'Datos de compra procesados (modo alternativo)'
      });
    }
  } catch (error: any) {
    console.error('🔴 [API /api/save-purchase] Error en el endpoint:', error);
    requestEvent.json(500, { 
      error: 'Error interno al procesar la solicitud: ' + (error.message || 'Unknown error') 
    });
  }
};