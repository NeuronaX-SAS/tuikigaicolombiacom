/** @jsxImportSource @builder.io/qwik */
import { render } from '@builder.io/qwik';
import { setupAPIInterceptor } from './api';
import Root from './root';

/**
 * Punto de entrada principal de la aplicación TUIKIGAI
 * Inicializa la aplicación Qwik y monta el componente raíz
 */
const mountApp = async () => {
  try {
    // Configurar el interceptor de API (versión simplificada)
    setupAPIInterceptor();
    
    // Seleccionar el elemento contenedor
    const container = document.getElementById('app');
    
    if (!container) {
      throw new Error('No se encontró el elemento con id "app" para montar la aplicación');
    }

    // Renderizar la aplicación usando el componente Root
    console.log('Montando aplicación TUIKIGAI...');
    
    // Evitar referencias circulares usando el componente Root
    await render(container, <Root />);
    
    console.log('Aplicación TUIKIGAI montada correctamente');

    // Registrar analytics de Cloudflare si está en producción
    if (import.meta.env.PROD) {
      // Cargar Web Analytics de Cloudflare
      const script = document.createElement('script');
      script.defer = true;
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      script.setAttribute('data-cf-beacon', '{"token": "tu-token-de-cloudflare-analytics"}');
      document.head.appendChild(script);
    }
  } catch (error) {
    console.error('Error al montar la aplicación:', error);
    
    // Mostrar mensaje de error en la página con más detalles
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
          <h2 style="color: #e53e3e;">Error al cargar la aplicación</h2>
          <p>Hubo un problema al inicializar TUIKIGAI. Por favor intenta recargar la página.</p>
          <div style="background: #f7fafc; padding: 15px; text-align: left; margin-top: 20px; border-radius: 5px; overflow-x: auto;">
            <p><strong>Error:</strong> ${error.message}</p>
            <p><small>Si el problema persiste, contacta al soporte técnico.</small></p>
          </div>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #4299e1; color: white; border: none; border-radius: 5px; cursor: pointer;">Recargar página</button>
        </div>
      `;
    }
  }
};

// Manejar errores no capturados
window.addEventListener('error', (event) => {
  console.error('Error no capturado:', event.error);
  
  // Evitar serialización circular en la consola
  try {
    // Intentar registrar detalles del error sin usar JSON.stringify directamente
    console.error('Mensaje:', event.error?.message);
    console.error('Nombre:', event.error?.name);
    console.error('Stack:', event.error?.stack);
  } catch (logError) {
    console.error('Error al registrar detalles del error:', logError.message);
  }
});

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}