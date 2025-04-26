// DEBUG LOG: entry.dev.tsx loaded at runtime
import './utils/jsonPatch.js';
import { render, type RenderOptions } from '@builder.io/qwik';
import Root from './root';
import { setupAPIInterceptor } from './api';

/**
 * Punto de entrada para el entorno de desarrollo
 * Inicializa los servicios necesarios y renderiza la aplicación
 */
export default function (opts: RenderOptions) {
  // El patching de JSON.stringify ya está implementado en utils/jsonPatch
  // que se importa al inicio de este archivo

  // Configurar el interceptor de API si existe
  if (typeof setupAPIInterceptor === 'function') {
    setupAPIInterceptor();
  }

  // Registrar message para depuración
  console.log('Iniciando TUIKIGAI en modo desarrollo...');
  
  // Devolver la función de renderizado de Qwik
  return render(document, <Root />, opts);
}