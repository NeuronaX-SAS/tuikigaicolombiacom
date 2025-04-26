// --- SIIGO integration is currently disabled. ---
// All payment processing is handled by Mercado Pago. SIIGO methods are preserved for future use.

/**
 * SiigoPaymentService - Servicio para integración con la API de SIIGO para pagos
 */

// Credenciales de API definidas
const API_USER = 'capitalmartech@gmail.com';
const API_KEY = 'MDMwYjcyYWUtZTM3NC00MjYzLTgwMzUtOTRlMWE3MmNjZjRhOjguSzhnIT59Nk0=';
const API_BASE_URL = 'https://api.siigo.com/v1';

// Interfaces para la API
export interface PaymentRequest {
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  transactionId: string;
  paymentUrl: string;
  status: string;
  createdAt: string;
}

/**
 * Clase para gestionar la integración con SIIGO Payments
 */
export class SiigoPaymentService {
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  /**
   * Iniciar sesión para obtener un token de autenticación
   */
  private async authenticate(): Promise<string> {
    // Si ya tenemos un token válido, lo devolvemos
    if (this.token && this.tokenExpiration && new Date() < this.tokenExpiration) {
      return this.token;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: API_USER,
          access_key: API_KEY,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al autenticar: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.access_token;
      
      // Calcular expiración (típicamente 1 hora)
      this.tokenExpiration = new Date();
      this.tokenExpiration.setHours(this.tokenExpiration.getHours() + 1);
      
      return this.token || '';
    } catch (error) {
      console.error('Error durante la autenticación:', error);
      throw new Error('No se pudo autenticar con la API de SIIGO');
    }
  }

  /**
   * Crear una solicitud de pago
   */
  public async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer: {
            id: request.userId,
            name: request.userName,
            email: request.userEmail,
          },
          payment: {
            amount: request.amount,
            currency: request.currency,
            description: request.description,
          },
          metadata: request.metadata || {},
          return_url: window.location.origin + '/payment/success',
          cancel_url: window.location.origin + '/payment/cancel',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al crear pago: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      throw new Error('No se pudo procesar el pago. Por favor, inténtalo de nuevo.');
    }
  }

  /**
   * Verificar el estado de un pago
   */
  public async checkPaymentStatus(transactionId: string): Promise<string> {
    try {
      const token = await this.authenticate();
      
      const response = await fetch(`${API_BASE_URL}/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al verificar estado: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error al verificar estado de pago:', error);
      throw new Error('No se pudo verificar el estado del pago');
    }
  }
  
  /**
   * Método para simular pago (desarrollo)
   * Nota: Este método es solo para desarrollo y pruebas
   */
  public simulatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      // Simulamos un retraso de red
      setTimeout(() => {
        resolve({
          transactionId: 'sim_' + Math.random().toString(36).substring(2, 15),
          paymentUrl: 'https://checkout.siigo.com/simulate',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }, 1000);
    });
  }
}

// Exportamos una instancia única del servicio
export const siigoPaymentService = new SiigoPaymentService();