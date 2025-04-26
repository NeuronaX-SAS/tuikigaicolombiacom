import { $ } from '@builder.io/qwik';
import { safeStringify } from '../api';

// Interfaces
export interface MercadoPagoItem {
  id?: string; 
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface MercadoPagoPayer {
  email: string;
  name?: string; 
}

export interface PreferenceRequest {
  items: MercadoPagoItem[];
  payer: MercadoPagoPayer;
  back_urls?: { 
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all'; 
  external_reference?: string;
}

export interface PreferenceResponse {
  id: string; 
  init_point: string; 
  sandbox_init_point?: string;
}

// Declaración para TypeScript
declare global {
  interface Window {
    MercadoPago: any;
  }
}

// --- CLASE DEL SERVICIO ---
export class MercadoPagoService {
  // Estado como propiedades de clase en lugar de variables globales
  private PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';
  private sdkInitialized = false;
  private mpInstance: any = null;
  private isInitializing = false;
  private hasTrackingPrevention = false;
  private lastError: Error | null = null;

  constructor() {
    if (!this.PUBLIC_KEY) {
      console.error('MercadoPagoService: PUBLIC_KEY is not set. Please set VITE_MERCADOPAGO_PUBLIC_KEY in your environment.');
    }
    // Constructor vacío
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private setLastError(error: Error | string | unknown): Error {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.lastError = errorObj;
    return errorObj;
  }

  public getLastError(): Error | null {
    const error = this.lastError;
    this.lastError = null;
    return error;
  }

  // Función para evitar referencias circulares en logs
  private safeLog(message: string, data?: any): void {
    console.log(message);
    if (data) {
      try {
        // Usar safeStringify para evitar errores de serialización circular
        console.log(typeof data === 'object' ? safeStringify(data) : data);
      } catch (error) {
        console.log('No se pudo serializar los datos para el log');
      }
    }
  }

  private testBrowserStorage(): boolean {
    try {
      const testKey = 'mp_storage_test';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('MercadoPagoService: Browser storage access restricted. Using fallback mode.');
      return false;
    }
  }

  // Inicializa el SDK de Mercado Pago v2 usando el enfoque recomendado por la documentación
  public initSDK = $(async (): Promise<boolean> => {
    // Referencia segura a this
    const self = mercadoPagoService;
    
    // Verificación de entorno
    if (!self.isBrowser()) {
      console.warn('MercadoPagoService: Omitiendo inicialización de SDK en el servidor.');
      return false;
    }

    // Verificación de estado
    if (self.sdkInitialized && self.mpInstance) {
      console.log('MercadoPagoService: SDK ya inicializado.');
      return true;
    }

    if (self.isInitializing) {
      console.log('MercadoPagoService: Inicialización en progreso, esperando...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return self.sdkInitialized;
    }

    self.isInitializing = true;
    self.lastError = null;

    // Test storage access and set tracking prevention flag
    self.hasTrackingPrevention = !self.testBrowserStorage();

    try {
      console.log('MercadoPagoService: Iniciando SDK de Mercado Pago...');

      // Cargar el script de Mercado Pago manualmente
      console.log('MercadoPagoService: Cargando script de Mercado Pago...');
      
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      
      // Esperar a que el script cargue
      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          console.log('MercadoPagoService: Script cargado exitosamente');
          resolve();
        };
        
        script.onerror = (e) => {
          console.error('MercadoPagoService: Error al cargar script:', e);
          reject(new Error('Error al cargar el script de Mercado Pago'));
        };
        
        document.head.appendChild(script);
      });
      
      // Wait for MercadoPago to be available in window
      await new Promise<void>((resolve) => {
        const checkMercadoPago = (attempts = 0) => {
          if (typeof window.MercadoPago !== 'undefined') {
            resolve();
          } else if (attempts < 20) {
            setTimeout(() => checkMercadoPago(attempts + 1), 100);
          } else {
            console.warn('MercadoPagoService: Tiempo de espera agotado para MercadoPago');
            resolve(); // Resolve anyway to avoid hanging
          }
        };
        checkMercadoPago();
      });
      
      if (typeof window.MercadoPago === 'undefined') {
        throw new Error('MercadoPago no está disponible después de cargar el script');
      }
      
      // Crear instancia de MercadoPago con las opciones adecuadas para prevención de tracking
      self.mpInstance = new window.MercadoPago(self.PUBLIC_KEY, {
        locale: 'es-CO',
        advancedFraudPrevention: !self.hasTrackingPrevention,
        trackingDisabled: self.hasTrackingPrevention,
        statusPageId: 'TUIKIGAI'
      });
      
      self.sdkInitialized = true;
      self.isInitializing = false;
      console.log('MercadoPagoService: SDK inicializado correctamente');
      return true;

    } catch (error) {
      console.error('MercadoPagoService: Error inicializando SDK:', error);
      self.setLastError(error);
      self.isInitializing = false;
      return false;
    }
  });

  // Llama al backend para crear una preferencia de pago
  public createPreference = $(async (preferenceData: PreferenceRequest): Promise<PreferenceResponse | null> => {
    // Referencia segura a this
    const self = mercadoPagoService;
    
    console.log('MercadoPagoService: Solicitando creación de preferencia al backend...');
    self.lastError = null; // Limpiar error previo
    try {
      // Usar path relativo SIN barra al final para evitar el error 404
      // Use path relativo CON barra al final para evitar redirect 3xx que cambia a GET
      const apiUrl = '/api/create-preference/';
      console.log('MercadoPagoService: Llamando a API en:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(preferenceData),
      });

      const responseBodyText = await response.text(); // Leer como texto para depurar
      console.log('MercadoPagoService: Respuesta recibida (texto):', 
        responseBodyText ? responseBodyText.substring(0, 200) + '...' : '[empty]');

      if (!response.ok) {
         console.error(`MercadoPagoService: Error ${response.status} del backend al crear preferencia:`, responseBodyText);
         let errorJson: { message?: string; error?: string } = { message: `Error del servidor (${response.status})` };
         
         try { 
            // Intentar parsear la respuesta como JSON
            errorJson = JSON.parse(responseBodyText);
         } catch(e) {
            // Si no es JSON, verificar si es HTML
            if (responseBodyText.includes('<!DOCTYPE') || responseBodyText.includes('<html')) {
               console.error('MercadoPagoService: La respuesta parece ser HTML, lo que indica un problema de enrutamiento.');
               self.setLastError('Error de enrutamiento al llamar al API. Verifique la configuración del servidor.');
               return null;
            }
         }
         
         self.setLastError(errorJson.message || errorJson.error || `HTTP error ${response.status}`);
         return null;
      }

      let data: PreferenceResponse;
      
      try {
        // Intentar parsear como JSON
        data = JSON.parse(responseBodyText);
        console.log('MercadoPagoService: Respuesta parseada correctamente');
        self.safeLog('MercadoPagoService: Datos de la preferencia:', data);
      } catch (parseError) {
        console.error('MercadoPagoService: Error parseando respuesta JSON:', parseError, 'Raw response:', responseBodyText);
        self.setLastError('Respuesta inválida del servidor: No se pudo parsear JSON');
        return null;
      }
      
      // Validar que la respuesta contenga los campos esperados
      if (!data.id || !data.init_point) {
        console.error('MercadoPagoService: Respuesta incompleta del API');
        self.safeLog('MercadoPagoService: Datos incompletos:', data);
        self.setLastError('Respuesta incompleta del servidor: Faltan campos requeridos');
        return null;
      }
      
      console.log('MercadoPagoService: Preferencia creada exitosamente en backend:', data.id);
      return data;

    } catch (error) {
      console.error('MercadoPagoService: Error al llamar al backend para crear preferencia:', error);
      self.setLastError(error);
      return null; // Devuelve null en caso de error
    }
  });
}

// Instancia global
export const mercadoPagoService = new MercadoPagoService();