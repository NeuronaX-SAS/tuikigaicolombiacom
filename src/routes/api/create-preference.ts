import type { RequestHandler } from '@builder.io/qwik-city';
import type { PreferenceRequest as LocalPreferenceRequest } from '../../services/MercadoPagoService';

// Redirect to the folder-based endpoint for better organization
export const onPost: RequestHandler = async ({ request, json, url }) => {
  console.log(`\n--- Redirecting to folder-based endpoint ---`);
  
  try {
    // Forward the request to the folder-based endpoint
    const response = await fetch(`${url.origin}/api/create-preference/`, {
      method: 'POST',
      headers: request.headers,
      body: request.body
    });
    
    // Return the same response
    const data = await response.json();
    json(response.status, data);
  } catch (error) {
    console.error('Error redirecting to folder-based endpoint:', error);
    json(500, {
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};