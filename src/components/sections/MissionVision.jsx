import { component$ } from '@builder.io/qwik';

/**
 * Componente MissionVision - Sección con parallax que muestra la misión y visión
 * Incluye información sobre el equipo TUIKIGAI
 */
export default component$(() => {
  return (
    <section id="mission-vision" class="py-16 px-4 bg-gray-50">
      <div class="container mx-auto">
        <h2 class="text-3xl md:text-4xl text-center mb-12">Nuestra Misión y Visión</h2>
        
        {/* Contenedor de parallax */}
        <div class="parallax-container relative h-[60vh] overflow-hidden rounded-xl mb-12">
          {/* Capa de fondo (más lenta) */}
          <div class="parallax-layer parallax-layer-back absolute inset-0">
            <div class="w-full h-full bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')`,
              filter: 'brightness(0.7)'
            }}></div>
          </div>
          
          {/* Capa de contenido (normal) */}
          <div class="parallax-layer parallax-layer-base flex items-center justify-center">
            <div class="bg-white bg-opacity-90 p-8 rounded-lg max-w-2xl text-center">
              <h3 class="text-2xl font-semibold mb-4">Nuestra Misión</h3>
              <p class="text-lg mb-6">
                Ayudar a las personas a descubrir su propósito de vida a través de la metodología Ikigai, 
                facilitando la conexión entre lo que aman, sus talentos, las necesidades del mundo y 
                las oportunidades de sustento económico.
              </p>
              <h3 class="text-2xl font-semibold mb-4">Nuestra Visión</h3>
              <p class="text-lg">
                Ser reconocidos como la plataforma líder en Latinoamérica para el descubrimiento 
                del propósito personal, impactando positivamente en la vida de miles de personas 
                que buscan claridad vocacional y realización personal.
              </p>
            </div>
          </div>
        </div>
        
        {/* Equipo TUIKIGAI */}
        <div class="mt-16">
          <h3 class="text-2xl text-center mb-8">Nuestro Equipo</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Miembro del equipo 1 */}
            <div class="ikigai-card text-center">
              <div class="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Coach de Ikigai" 
                  class="w-full h-full object-cover"
                />
              </div>
              <h4 class="text-xl font-semibold mb-2">Ana Martínez</h4>
              <p class="text-gray-600 mb-3">Coach de Propósito</p>
              <p class="text-sm text-gray-500">
                Especialista en desarrollo personal con más de 10 años de experiencia 
                guiando a profesionales en la búsqueda de su propósito.
              </p>
            </div>
            
            {/* Miembro del equipo 2 */}
            <div class="ikigai-card text-center">
              <div class="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                  alt="Especialista en Ikigai" 
                  class="w-full h-full object-cover"
                />
              </div>
              <h4 class="text-xl font-semibold mb-2">Carlos Ramírez</h4>
              <p class="text-gray-600 mb-3">Especialista en Ikigai</p>
              <p class="text-sm text-gray-500">
                Certificado en metodología Ikigai por el Instituto Japonés de Estudios 
                de Propósito, ha ayudado a más de 500 personas a encontrar su camino.
              </p>
            </div>
            
            {/* Miembro del equipo 3 */}
            <div class="ikigai-card text-center">
              <div class="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80" 
                  alt="Asesora de Carrera" 
                  class="w-full h-full object-cover"
                />
              </div>
              <h4 class="text-xl font-semibold mb-2">Laura Gómez</h4>
              <p class="text-gray-600 mb-3">Asesora de Carrera</p>
              <p class="text-sm text-gray-500">
                Psicóloga organizacional con enfoque en desarrollo de carrera y 
                transiciones profesionales basadas en propósito y valores personales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});