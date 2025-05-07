// Handle GET requests to /api/create-preference with a clear error message
import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  console.warn('GET request received at /api/create-preference. Only POST is supported.');
  json(405, { error: 'Method Not Allowed. Use POST for this endpoint.' });
};

export const onPost: RequestHandler = async ({ request, json, url }) => {
  console.log(`\n--- API: /api/create-preference POST request received ---`);
  console.log('Available env vars:', JSON.stringify(import.meta.env, null, 2));
  console.log(`Request URL: ${url.href}`);

  // Use environment variable for API key
  const ACCESS_TOKEN = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN;
  
  if (!ACCESS_TOKEN) {
    console.error("API Error: ACCESS_TOKEN is missing from environment variables");
    json(500, { error: 'Server configuration error: Missing Mercado Pago credentials.' });
    return;
  }

  try {
    const body = await request.json();
    console.log('API: Request body:', JSON.stringify(body, null, 2));

    // Validate request body
    if (!body || !body.items || body.items.length === 0) {
      console.error('API: Invalid preference data - missing items:', body);
      json(400, { error: 'Invalid preference data: Missing items' });
      return;
    }
    
    if (!body.payer || !body.payer.email) {
      console.error('API: Invalid preference data - missing payer info:', body.payer);
      json(400, { error: 'Invalid preference data: Missing payer information' });
      return;
    }

    // Prepare data for Mercado Pago API
    // Use back_urls directly from the request body
    const mpPreferenceData = {
      items: body.items.map((item: any) => ({
        id: item.id || `tuikigai-item-${Date.now()}`,
        title: item.title,
        description: item.description || item.title,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        currency_id: item.currency_id || 'COP'
      })),
      payer: {
        email: body.payer.email,
        name: body.payer.name || 'Cliente TUIKIGAI'
      },
      back_urls: body.back_urls, // Use back_urls from the request body
      auto_return: 'approved', // Re-enable for production deployment
      external_reference: body.external_reference || `ikigai_${Date.now()}`,
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1
      },
      statement_descriptor: 'TUIKIGAI'
    };

    console.log('API: Calling Mercado Pago API with payload:', JSON.stringify(mpPreferenceData, null, 2)); // Log the exact payload
    
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(mpPreferenceData)
    });

    // For debugging purposes, read response as text first
    const mpResponseText = await mpResponse.text();
    console.log(`API: Mercado Pago response status: ${mpResponse.status}`);
    
    if (!mpResponse.ok) {
      console.error(`API: Mercado Pago API error (${mpResponse.status}):`, mpResponseText);
      json(mpResponse.status, { 
        error: 'Mercado Pago API error', 
        details: mpResponseText
      });
      return;
    }

    let mpResponseData;
    try {
      mpResponseData = JSON.parse(mpResponseText);
    } catch (parseError) {
      console.error('API: Error parsing Mercado Pago response:', parseError);
      json(500, { error: 'Invalid response from Mercado Pago API' });
      return;
    }

    // Validate response data
    if (!mpResponseData.id || !mpResponseData.init_point) {
      console.error('API: Invalid response from Mercado Pago API:', mpResponseData);
      json(500, { error: 'Invalid response from Mercado Pago API' });
      return;
    }

    // Return the needed data to frontend
    const responsePayload = {
      id: mpResponseData.id,
      init_point: mpResponseData.init_point,
      sandbox_init_point: mpResponseData.sandbox_init_point
    };

    console.log('API: Successfully created preference:', responsePayload);
    json(200, responsePayload);

  } catch (error) {
    console.error('API Error:', error);
    json(500, {
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Empty component for Qwik City
export default function CreatePreferenceEndpoint() {
  return null;
}