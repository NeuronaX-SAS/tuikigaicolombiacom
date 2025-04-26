import { createPreference, getPaymentInfo } from './mercadopago';
import type { PreferenceRequest, PreferenceResponse } from '../services/MercadoPagoService';
import type { IkigaiResponse, PromoCodeRequest, PurchaseData } from '../services/GoogleSheetsService';

// Import the correct Google Sheet utilities using ES module syntax
import { 
    ensureAuthenticated, 
    addIkigaiResponse, 
    addPromoCodeUsage, 
    addPurchase,
    updatePurchasePaymentStatus
} from '../../utils/googleSheetUtils.js'; // Keep .js extension if it's a JS file

// Define a combined type for the request body to /api/create-preference
// Use the updated PurchaseData type
type CombinedPreferencePurchaseRequest = PreferenceRequest & PurchaseData & {
    // Add any other specific fields if necessary, but PreferenceRequest + PurchaseData should cover most
}; 

// Tipo para las rutas
type RouteHandler = (request: Request) => Promise<Response>;
type Routes = {
  [path: string]: RouteHandler;
};

export const logRequest = (path: string, request: Request) => {
  console.log(`🔍 API Request: ${request.method} ${path}`);
  console.log(`📌 URL completa: ${request.url}`);
  return request;
}

// Definición de rutas API
const routes: Routes = {
  // Mercado Pago
  '/api/create-preference': async (request: Request) => {
    // Only require crypto on the server
    let purchaseAttemptReference: string = '';
    if (typeof window === 'undefined') {
      // Dynamically import crypto only on the server
      const crypto = await import('crypto');
      purchaseAttemptReference = crypto.randomUUID();
    } else {
      // Fallback for environments without crypto (should not happen in prod)
      purchaseAttemptReference = Math.random().toString(36).substring(2, 15);
    }
    try {
      logRequest('/api/create-preference', request);
      
      const body = await request.json() as CombinedPreferencePurchaseRequest;
      console.log('📦 Datos recibidos para preferencia y compra:', JSON.stringify(body, null, 2));

      // --- 1. Prepare Data for Mercado Pago Preference --- 
      const preferencePayload: PreferenceRequest = {
        items: body.items,
        payer: body.payer,
        back_urls: body.back_urls, 
        auto_return: body.auto_return || 'approved',
        // Use the generated UUID as external_reference for MP
        external_reference: purchaseAttemptReference, 
      };

      // --- 2. Create Mercado Pago Preference --- 
      console.log('🚀 Enviando a Mercado Pago para crear preferencia:', JSON.stringify(preferencePayload, null, 2));
      const preferenceResult: PreferenceResponse = await createPreference(preferencePayload);
      console.log('✅ Preferencia de MP creada:', JSON.stringify(preferenceResult, null, 2));
      const preferenceId = preferenceResult.id;

      // --- 3. Prepare Data for Google Sheet Purchase Record ---
      // Use the fields defined in the updated PurchaseData type
      const purchaseData: PurchaseData = {
        userName: body.userName || 'N/A', // Now exists on CombinedPreferencePurchaseRequest via PurchaseData
        email: body.payer?.email || body.email || 'N/A', // Email also exists on PurchaseData now
        love: body.love || '', // Exists on PurchaseData
        talent: body.talent || '', // Exists on PurchaseData
        need: body.need || '', // Exists on PurchaseData
        payment: body.payment || body.items?.[0]?.unit_price || 0, // Payment exists on PurchaseData
        purchaseType: body.purchaseType || 'Individual', // Exists on PurchaseData
        giftEmail: body.giftEmail || '', // Exists on PurchaseData
        giftMessage: body.giftMessage || '', // Exists on PurchaseData
        timestamp: new Date().toISOString(),
        orderNumber: preferenceId, // Use MP Preference ID as the initial order number
      };

      // --- 4. Save Initial Purchase Data to Google Sheets ---
      try {
          console.log('💾 Guardando datos iniciales de compra en Google Sheets:', JSON.stringify(purchaseData, null, 2));
          await ensureAuthenticated();
          await addPurchase(purchaseData);
          console.log('✅ Datos iniciales de compra guardados en Google Sheets');
      } catch (sheetError) {
          console.error('⚠️ Error guardando en Google Sheets (la preferencia de MP ya fue creada):', sheetError);
          // Decide how to handle this: Log it? Notify admin? 
          // The MP preference exists, but the sheet record failed.
          // We might need a retry mechanism or manual check later.
      }

      // --- 5. Return Mercado Pago Preference Result to Frontend ---
      return new Response(JSON.stringify(preferenceResult), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });

    } catch (error) {
      console.error('❌ Error general en /api/create-preference:', error);
      // If the error occurred *after* saving to sheets, we might have an orphaned sheet row.
      // Consider adding logic here to potentially clean up the sheet row if the preference creation failed critically *after* the sheet write.
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  },
  
  // Punto de prueba para verificar que la API está funcionando
  '/api/test': async (request: Request) => {
    logRequest('/api/test', request);
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'API funcionando correctamente',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  },
  
  // Google Sheets - Ikigai Responses
  '/api/save-ikigai': async (request: Request) => {
    try {
      logRequest('/api/save-ikigai', request);
      const body = await request.json() as IkigaiResponse;
      console.log('💾 [API /save-ikigai] Recibido:', JSON.stringify(body, null, 2));
      
      console.log('🔒 [API /save-ikigai] Intentando autenticar con Google Sheets...');
      await ensureAuthenticated(); // Ensure connection
      console.log('✅ [API /save-ikigai] Autenticación exitosa (o ya autenticado).');
      
      console.log('📝 [API /save-ikigai] Llamando a addIkigaiResponse...');
      await addIkigaiResponse(body); // Use the utility function
      console.log('👍 [API /save-ikigai] addIkigaiResponse completado sin errores.');
      
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      // Este log ahora SÍ debería aparecer si addIkigaiResponse lanza un error
      console.error('❌ [API /save-ikigai] Error en el handler:', error);
      return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  },
  
  // Google Sheets - Promo Code
  '/api/save-promo-code': async (request: Request) => {
    try {
      logRequest('/api/save-promo-code', request);
      const body = await request.json() as PromoCodeRequest;
      console.log('💾 Saving Promo Code usage:', JSON.stringify(body, null, 2));

      await ensureAuthenticated(); // Ensure connection
      await addPromoCodeUsage(body); // Use the utility function

      return new Response(JSON.stringify({ success: true }), { // Assuming success if no error thrown
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('❌ Error en /api/save-promo-code:', error);
      return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  },
  
  // Google Sheets - Purchase Data
  '/api/save-purchase': async (request: Request) => {
    try {
      logRequest('/api/save-purchase', request);
      const body = await request.json() as PurchaseData;
      console.log('💾 Saving Purchase data:', JSON.stringify(body, null, 2));
      
      await ensureAuthenticated(); // Ensure connection
      await addPurchase(body); // Use the utility function
      
      return new Response(JSON.stringify({ success: true }), { // Assuming success if no error thrown
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      console.error('❌ Error en /api/save-purchase:', error);
      return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  },

  // --- Payment Callback Handling ---
  '/payment/success': async (request: Request) => {
    try {
      logRequest('/payment/success', request);
      const url = new URL(request.url);
      const params = url.searchParams;

      // Extract parameters sent by Mercado Pago
      const paymentId = params.get('payment_id');
      const status = params.get('status');
      // This external_reference is the Preference ID we stored as orderNumber initially
      const orderNumberRef = params.get('preference_id'); 
      // MP might also send external_reference, but preference_id is more reliable here
      // const externalReference = params.get('external_reference'); 

      console.log(`💰 Payment Success Callback Received: paymentId=${paymentId}, status=${status}, orderNumberRef=${orderNumberRef}`);

      if (!paymentId || !status || !orderNumberRef) {
        console.error('Missing required query parameters from Mercado Pago success callback.');
        return new Response(JSON.stringify({ success: false, message: 'Missing parameters' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        });
      }

      // Optional: Verify payment status with MP API again for security
      // const paymentInfo = await getPaymentInfo(paymentId);
      // if (paymentInfo.status !== status || paymentInfo.status !== 'approved') { ... handle discrepancy ... }

      // Update Google Sheet only if status is approved (or handle other statuses if needed)
      if (status === 'approved') {
          await ensureAuthenticated();
          await updatePurchasePaymentStatus(orderNumberRef, { 
              paymentId: paymentId,
              paymentStatus: status 
          });
      } else {
          console.log(`Payment status is ${status}. Not updating sheet as 'approved'.`);
          // Optionally, still update the sheet with the non-approved status
          // await ensureAuthenticated();
          // await updatePurchasePaymentStatus(orderNumberRef, { paymentId: paymentId, paymentStatus: status });
      }

      // IMPORTANT: Redirect user to a frontend success page
      // The exact mechanism depends on your server framework (Qwik City? Express?)
      // Example conceptual redirect:
      // return Response.redirect(`${url.origin}/your-frontend-success-page?payment_id=${paymentId}&status=${status}`, 302);
      
      // For now, return a simple JSON response indicating success
      return new Response(JSON.stringify({ success: true, paymentId: paymentId, status: status }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });

    } catch (error) {
      console.error('❌ Error in /payment/success callback handler:', error);
      // IMPORTANT: Redirect user to a frontend error page
      // Example conceptual redirect:
      // return Response.redirect(`${new URL(request.url).origin}/your-frontend-error-page`, 302);
      
      return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  },

  // TODO: Add handlers for /payment/failure and /payment/pending if needed
  // These would likely just redirect to corresponding frontend pages

};

export default routes;