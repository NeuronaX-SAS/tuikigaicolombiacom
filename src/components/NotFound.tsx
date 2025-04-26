import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

/**
 * Componente que maneja las rutas no encontradas (404)
 * Proporciona una experiencia amigable para el usuario cuando 
 * navega a una ruta que no existe
 */
export default component$(() => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center bg-white rounded-xl shadow-xl overflow-hidden p-10">
        <div class="mb-8">
          <h1 class="text-6xl font-bold text-red-500">404</h1>
          <div class="w-16 h-1 bg-red-500 mx-auto my-4"></div>
          <h2 class="text-2xl font-semibold mb-4">Página no encontrada</h2>
          <p class="text-gray-600 mb-6">
            Lo sentimos, la página que estás buscando no existe o ha sido trasladada.
          </p>
        </div>
        
        <div class="flex flex-col space-y-4">
          <Link 
            href="/" 
            class="inline-block bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-primary-dark transition duration-300"
          >
            Volver al inicio
          </Link>
          
          <button 
            onClick$={() => window.history.back()}
            class="inline-block bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-300"
          >
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
});