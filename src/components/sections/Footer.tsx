import { component$ } from '@builder.io/qwik';
import { getAssetPath } from '../../utils/assetPath';

/**
 * Componente Footer - Pie de página premium con información de contacto y créditos
 * Diseño mejorado con la nueva paleta de colores y efectos visuales
 */
export default component$(() => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer class="bg-gradient-to-br from-tuikigai-navy to-tuikigai-blue text-white py-16 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-tuikigai-teal blur-[100px] opacity-30"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white blur-[80px] opacity-20"></div>
      </div>
      
      {/* Patrón de círculos superpuestos (símil al logo) */}
      <div class="absolute top-10 right-10 opacity-10">
        <div class="relative w-40 h-40">
          <div class="absolute top-0 left-0 w-24 h-24 rounded-full border-2 border-tuikigai-teal"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 rounded-full border-2 border-white"></div>
          <div class="absolute top-0 right-0 w-24 h-24 rounded-full border-2 border-tuikigai-cream"></div>
          <div class="absolute bottom-0 right-0 w-24 h-24 rounded-full border-2 border-tuikigai-blue"></div>
        </div>
      </div>
      
      <div class="container mx-auto px-4 relative z-10">
        {/* Logo y descripción */}
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <div class="col-span-1 md:col-span-4">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 relative mr-3">
                <div class="absolute inset-0 rounded-full bg-gradient-to-br from-tuikigai-teal to-tuikigai-blue animate-spin-slow"></div>
                <div class="absolute inset-2 rounded-full bg-tuikigai-navy flex items-center justify-center">
                  <span class="text-xl font-bold text-white">TU</span>
                </div>
              </div>
              <h2 class="text-3xl font-bold">TUIKIGAI</h2>
            </div>
            
            <p class="text-gray-300 mb-8 max-w-md text-justify">
              La herramienta definitiva para descubrir tu propósito de vida
              a través del concepto japonés del Ikigai. Encuentra el equilibrio
              perfecto entre tu pasión, talento, propósito y sustento.
            </p>
            
            {/* Redes sociales con efecto hover */}
            <div class="flex space-x-3">
              <a 
                href="https://api.whatsapp.com/send/?phone=573150703733&text&type=phone_number&app_absent=0" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="w-10 h-10 rounded-full bg-white bg-opacity-10 flex items-center justify-center hover:bg-tuikigai-teal transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <img src="/whatsapp-svg-icon.svg" alt="WhatsApp" class="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Enlaces de navegación - ELIMINAMOS LA SECCIÓN EXPLORAR */}
          
          {/* Información legal */}
          <div class="col-span-1 md:col-span-4">
            <h3 class="text-xl font-bold mb-4 text-tuikigai-teal">Legal</h3>
            <ul class="space-y-3">
              <li>
                <a href={getAssetPath('documents/Política de Tratamiento de Datos Personales.pdf')} class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center" download>
                  <span class="w-1.5 h-1.5 rounded-full bg-tuikigai-teal mr-2"></span>
                  Política de Tratamiento de Datos
                </a>
              </li>
              <li>
                <a href={getAssetPath('documents/Términos y Condiciones.pdf')} class="text-gray-300 hover:text-white transition-colors duration-200 flex items-center" download>
                  <span class="w-1.5 h-1.5 rounded-full bg-tuikigai-teal mr-2"></span>
                  Términos y Condiciones
                </a>
              </li>
            </ul>
            <p class="mt-6 text-sm text-gray-400">
              En TUIKIGAI cumplimos con las normas de protección de datos personales y protección al consumidor. Para ejercer sus derechos puede consultar en la{' '}<a href="https://www.sic.gov.co/tema/proteccion-de-datos-personales" target="_blank" rel="noopener noreferrer" class="text-tuikigai-teal hover:underline">Superintendencia de Industria y Comercio</a>.
            </p>
          </div>
          
          {/* Contacto */}
          <div class="col-span-1 md:col-span-4">
            <h3 class="text-xl font-bold mb-4 text-tuikigai-teal">Contacto</h3>
            <ul class="space-y-4">
              <li class="flex items-start gap-3">
                <div class="mt-1 w-5 h-5 text-tuikigai-teal flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-white font-medium">Email</p>
                  <a href="mailto:tuikigaicolombia@gmail.com" class="text-gray-300 hover:text-tuikigai-teal transition-colors">tuikigaicolombia@gmail.com</a>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 w-5 h-5 text-tuikigai-teal flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p class="text-white font-medium">Teléfono</p>
                  <a href="tel:+573150703733" class="text-gray-300 hover:text-tuikigai-teal transition-colors">+57 315 070 3733</a>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-1 w-5 h-5 text-tuikigai-teal flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-white font-medium">Dirección</p>
                  <p class="text-gray-300">Bogotá, Colombia</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Separador con diseño */}
        <div class="flex items-center justify-center my-8">
          <div class="h-px bg-white bg-opacity-20 w-full"></div>
          <div class="px-6">
            <div class="w-8 h-8 rounded-full flex items-center justify-center bg-white bg-opacity-10">
              <div class="w-4 h-4 rounded-full bg-tuikigai-teal"></div>
            </div>
          </div>
          <div class="h-px bg-white bg-opacity-20 w-full"></div>
        </div>
        
        {/* Copyright y créditos */}
        <div class="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div class="mb-4 md:mb-0">
            <p>© {currentYear} TUIKIGAI - Descubre tu propósito</p>
          </div>
          
          <div class="flex items-center gap-4">
            <p>Desarrollado con <span class="text-tuikigai-teal">♥</span> por NeuronaX S.A.S.</p>
            <div class="flex gap-2">
              <a href="#" class="text-gray-400 hover:text-tuikigai-teal transition-colors">
                <span class="sr-only">GitHub</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-tuikigai-teal transition-colors">
                <span class="sr-only">LinkedIn</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});