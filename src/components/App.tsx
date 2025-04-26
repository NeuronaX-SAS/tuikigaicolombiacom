import { component$, useVisibleTask$ } from '@builder.io/qwik';
import UnifiedIkigai from './sections/UnifiedIkigai';
import Footer from './sections/Footer';
import { mercadoPagoService } from '../services/MercadoPagoService';

/**
 * Componente principal de la aplicación TUIKIGAI
 * Versión simplificada que utiliza el nuevo componente unificado
 */
export default component$(() => {
  // Inicializar servicios cuando el componente se monta y el DOM está cargado
  useVisibleTask$(({ track }) => {
    // Usar track para que la tarea se ejecute cada vez que el documento cambie de estado
    track(() => typeof document !== 'undefined' && document.readyState);
    
    // Solo inicializamos cuando el documento está completamente cargado
    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      console.log('DOM completamente cargado, iniciando SDK de Mercado Pago');
      
      // Iniciar el SDK con un pequeño retraso para asegurar que el DOM esté completamente listo
      setTimeout(() => {
        mercadoPagoService.initSDK().catch(error => {
          console.error('Error al inicializar el SDK de Mercado Pago:', error);
        });
      }, 500);
    }
  });
  
  return (
    <div class="flex flex-col min-h-screen">
      {/* Contenido principal unificado */}
      <main class="flex-grow">
        <UnifiedIkigai />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
});