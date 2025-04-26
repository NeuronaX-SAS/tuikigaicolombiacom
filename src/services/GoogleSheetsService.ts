// --- Google Sheets integration is currently disabled. ---
// All user data is stored in Firestore. Google Sheets methods are preserved for future use.

/**
 * GoogleSheetsService - Servicio para integración con Google Sheets API
 * 
 * Este servicio maneja la interacción con la API de Google Sheets para
 * almacenar respuestas del Ikigai, información de compra y códigos promocionales.
 */

// URL de la API de Google Sheets (implementada con Google Apps Script)
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbxw6Sg0CGg4inp09tqyi03Ed3mRTB0L1nWQGXtarwuwdCOnyJVZFVF0syEmMLDnOu2m/exec';

// Tipos de datos para las peticiones
export interface IkigaiResponse {
  userName: string;
  love: string;
  talent: string;
  need: string;
  payment: string;
  timestamp: string;
}

export interface PromoCodeRequest {
  name: string;
  email: string;
  promoCode: string;
  ikigaiData?: {
    userName: string;
    love: string;
    talent: string;
    need: string;
    payment: string;
  };
  timestamp: string;
}

export interface PurchaseData {
  // Aligning with the Google Sheet Columns specified by the user
  userName: string; 
  email: string; 
  love: string; 
  talent: string; 
  need: string; 
  payment: number | string; // Allow number for amount, string if it comes differently
  purchaseType: string; // e.g., 'Individual', 'Gift'
  giftEmail?: string; // Optional fields
  giftMessage?: string; // Optional fields
  timestamp: string; // Keep ISO string format
  orderNumber: string; // Use this for Preference ID initially, then maybe Payment ID
}

/**
 * Clase principal del servicio de Google Sheets
 */
export class GoogleSheetsService {
  /**
   * Guarda las respuestas del Ikigai en Google Sheets
   */
  public async saveIkigaiResponses(data: IkigaiResponse): Promise<boolean> {
    try {
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
  public async savePromoCodeRequest(data: PromoCodeRequest): Promise<boolean> {
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
  public async savePurchaseData(data: PurchaseData): Promise<boolean> {
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
}

// Exportar una instancia única del servicio
export const googleSheetsService = new GoogleSheetsService();