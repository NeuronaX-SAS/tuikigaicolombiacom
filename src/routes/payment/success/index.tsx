import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <section class="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-white">
      <div class="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-4 sm:p-6 md:p-8 border border-green-100">
        <div class="text-center mb-4 sm:mb-6">
          <div class="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-green-100 mb-3 sm:mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 sm:h-12 sm:w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-800">¡Pago completado!</h1>
          <p class="text-sm sm:text-base text-gray-600 mt-2">Tu pago ha sido procesado correctamente.</p>
        </div>

        <div class="bg-green-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <p class="text-sm text-green-800">
            Hemos enviado los detalles de tu compra a tu correo electrónico. Por favor verifica tu bandeja de entrada y carpeta de spam.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <Link href="/" class="w-full py-2 sm:py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg text-center font-medium text-sm sm:text-base hover:shadow-lg transition duration-300">
            Volver al inicio
          </Link>
          <a 
            href="mailto:soporte@tuikigai.co" 
            class="w-full py-2 sm:py-3 bg-white border border-slate-300 text-slate-700 rounded-lg text-center font-medium text-sm sm:text-base hover:bg-slate-50 transition duration-300"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </section>
  );
});
