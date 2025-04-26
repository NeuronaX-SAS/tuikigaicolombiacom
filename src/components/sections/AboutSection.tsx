import { component$ } from '@builder.io/qwik';

/**
 * Componente AboutSection - Sección "Acerca de" con información sobre Ikigai
 * Diseño mejorado con la nueva paleta de colores
 */
export default component$(() => {
  return (
    <section id="about" class="py-24 bg-white">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center mb-16">
          <span class="text-tuikigai-teal font-medium tracking-wider text-sm uppercase">Descubre el concepto</span>
          <h2 class="text-4xl font-bold text-tuikigai-navy mt-2 mb-6">¿Qué es el Ikigai?</h2>
          <div class="h-1 w-20 bg-tuikigai-teal mx-auto rounded-full mb-8"></div>
          <p class="text-gray-600 text-lg leading-relaxed">
            El Ikigai es un concepto japonés que significa "razón de ser" o "motivo de existencia". 
            Está formado por la intersección de cuatro elementos fundamentales que dan sentido y 
            propósito a nuestra vida, creando un estado de satisfacción y realización personal.
          </p>
        </div>

        {/* Elementos del Ikigai */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div class="bg-white p-6 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:scale-102 border border-gray-100">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-tuikigai-teal to-tuikigai-blue mb-6 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-tuikigai-navy mb-3">Lo que amas</h3>
            <p class="text-gray-600">
              Actividades y pasiones que te brindan alegría y te hacen perder la noción del tiempo.
              Lo que te llena de energía y entusiasmo.
            </p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:scale-102 border border-gray-100">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-tuikigai-blue to-tuikigai-navy mb-6 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-tuikigai-navy mb-3">En lo que eres bueno</h3>
            <p class="text-gray-600">
              Tus talentos naturales, habilidades y fortalezas. Lo que otras personas reconocen en ti como un don especial.
            </p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:scale-102 border border-gray-100">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-tuikigai-teal to-tuikigai-blue mb-6 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-tuikigai-navy mb-3">Lo que el mundo necesita</h3>
            <p class="text-gray-600">
              Problemas o necesidades que puedes ayudar a resolver. Contribuciones que puedes hacer para mejorar la vida de otros.
            </p>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:scale-102 border border-gray-100">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-tuikigai-blue to-tuikigai-navy mb-6 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-tuikigai-navy mb-3">Por lo que te pagarían</h3>
            <p class="text-gray-600">
              Servicios o productos por los que las personas estarían dispuestas a pagar. El valor económico que puedes ofrecer.
            </p>
          </div>
        </div>

        {/* Beneficios del Ikigai */}
        <div class="max-w-4xl mx-auto">
          <div class="bg-gradient-radial from-tuikigai-cream to-white p-8 rounded-2xl shadow-inner-glow">
            <h3 class="text-2xl font-bold text-tuikigai-navy mb-6 text-center">
              Beneficios de descubrir tu Ikigai
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-tuikigai-teal bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-tuikigai-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-tuikigai-navy mb-2">Mayor satisfacción vital</h4>
                  <p class="text-gray-600">Vivir con propósito aumenta significativamente tu bienestar general y felicidad.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-tuikigai-teal bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-tuikigai-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-tuikigai-navy mb-2">Motivación intrínseca</h4>
                  <p class="text-gray-600">Descubre una fuente inagotable de motivación que surge desde tu interior.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-tuikigai-teal bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-tuikigai-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-tuikigai-navy mb-2">Mejora tu productividad</h4>
                  <p class="text-gray-600">Cuando trabajas en lo que tiene sentido para ti, tu eficiencia y resultados se potencian.</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-tuikigai-teal bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-tuikigai-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-tuikigai-navy mb-2">Claridad en decisiones</h4>
                  <p class="text-gray-600">Tomar decisiones se vuelve más sencillo cuando tienes claridad sobre tu propósito de vida.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}); 