import { component$ } from '@builder.io/qwik';
import { type RequestHandler } from '@builder.io/qwik-city';
// Remove unused imports if they were only for the deleted logic
// import type { PreferenceRequest as LocalPreferenceRequest } from '../../services/MercadoPagoService';

// Configuración desde API Mercado Pago.txt (Keep if needed elsewhere, or remove)
// const ACCESS_TOKEN = 'APP_USR-240261110313946-042211-2ac5bcaa6657dc46979090e9bdc132c7-2375036063';
// const PUBLIC_KEY = 'APP_USR-40bf63c0-53b4-414f-a973-5d6fd0e596dc';

/**
 * Manejador de rutas de API generales NO ENCONTRADAS en otros archivos.
 */
export const onPost: RequestHandler = async (requestEvent) => {
  const { params, request, json, url } = requestEvent;
  const path = params.catchall;
  
  console.log(`[API Catchall POST] Request for UNHANDLED path: /api/${path}`);
  console.log(`Request URL: ${url.href}`);
  
  // Ya NO manejamos rutas específicas aquí. 
  // Si el request llega aquí, es porque no fue manejado por src/api/routes.ts
  // o un archivo dedicado como src/routes/api/create-preference/index.tsx

  /* --- DELETED SPECIFIC ROUTE HANDLING --- 
  // Verificando rutas específicas que ya están manejadas por archivos dedicados
  // if (path === 'create-preference') { ... }
  
  // Implementar API basada en la ruta
  if (path === 'save-ikigai') { ... }

  // API para guardar solicitud de código promocional
  if (path === 'save-promo-code') { ... }

  // API para guardar datos de compra
  if (path === 'save-purchase') { ... }
  */

  // Si llega aquí, la ruta no fue encontrada por ningún manejador específico.
  console.warn(`[API Catchall POST] Ruta API no encontrada: /api/${path}`);
  json(404, { error: `API route not found: /api/${path}` });
};

// Añadimos un handler para GET también, por si acaso
export const onGet: RequestHandler = async ({ params, json, url }) => {
    const path = params.catchall;
    console.log(`[API Catchall GET] Request for UNHANDLED path: /api/${path}`);
    console.log(`Request URL: ${url.href}`);
    console.warn(`[API Catchall GET] Ruta API no encontrada: /api/${path}`);
    json(404, { error: `API route not found: /api/${path}` });
};

// Componente vacío para Qwik City
export default component$(() => {
  // Se necesita un componente default aunque la lógica esté en los handlers onGet/onPost
  return null;
});