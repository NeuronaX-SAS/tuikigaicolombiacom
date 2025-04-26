import routes from './routes';

/**
 * Función utilitaria para serializar objetos de manera segura,
 * evitando referencias circulares
 */
export function safeStringify(obj: any, maxDepth = 3): string {
  if (obj === undefined) return 'undefined';
  if (obj === null) return 'null';
  
  // Usar cache para detectar referencias circulares
  const seen = new WeakSet();
  
  try {
    return JSON.stringify(obj, (key, value) => {
      // Manejo de valores primitivos y nulos
      if (value === null || typeof value !== 'object') {
        return value;
      }
      
      // Funciones y símbolos no se pueden serializar
      if (typeof value === 'function' || typeof value === 'symbol') {
        return `[${typeof value}]`;
      }
      
      // Evitar ciclos
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
      
      // Limitar la profundidad de recursión
      if (maxDepth <= 0) {
        return typeof value === 'object' ? 
          (Array.isArray(value) ? '[Array]' : '[Object]') : 
          value;
      }
      
      // Recursión con profundidad reducida para objetos anidados
      if (typeof value === 'object') {
        const newVal: any = Array.isArray(value) ? [] : {};
        for (const k in value) {
          if (Object.prototype.hasOwnProperty.call(value, k)) {
            try {
              // Usar stringify recursivamente con reducción de profundidad
              const stringified = safeStringify(value[k], maxDepth - 1);
              newVal[k] = stringified === 'undefined' || stringified === 'null' 
                ? stringified 
                : JSON.parse(stringified);
            } catch (e) {
              // Si hay error en el parsing, usar un placeholder
              newVal[k] = '[Unserializable]';
            }
          }
        }
        return newVal;
      }
      
      return value;
    });
  } catch (e) {
    // Fallback en caso de error
    return JSON.stringify({
      error: 'Error during serialization',
      message: e instanceof Error ? e.message : String(e)
    });
  }
}

/**
 * API handler for client-side requests
 * Este middleware intercepta las solicitudes a las rutas /api/
 */
export async function handleRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    
    console.log(`API Request: ${path}`);
    
    // Verificar si la ruta existe
    const handler = routes[path];
    
    if (handler) {
      return await handler(request);
    }
    
    // Ruta no encontrada
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  } catch (error) {
    console.error('API Error:', error);
    
    // Manejar el error de forma segura
    let errorMessage = 'Unknown API error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return new Response(JSON.stringify({ 
      error: 'API Error', 
      message: errorMessage 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}

/**
 * API handler simplificado para el modo de desarrollo
 * 
 * Esta versión evita problemas de serialización circular
 * y es más resiliente ante errores
 */
export function setupAPIInterceptor() {
  console.log('API interceptor configurado en modo de desarrollo');
  
  // En desarrollo, solo registramos que se configuró el interceptor
  // pero no modificamos el comportamiento de fetch
  
  // Agregar manejador global para errores de red
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof TypeError && 
        event.reason.message.includes('Failed to fetch')) {
      console.warn('Error de red detectado:', event.reason.message);
    }
  });
}

export default {
  handleRequest,
  setupAPIInterceptor,
  safeStringify
};