import { component$, useVisibleTask$, useSignal } from '@builder.io/qwik';

/**
 * Componente MissionVision - Muestra la misión y visión de TUIKIGAI con efecto parallax
 * Presenta fotos del equipo y descripción del propósito de la empresa
 */
export default component$(() => {
  const missionRef = useSignal<HTMLDivElement>();
  const visionRef = useSignal<HTMLDivElement>();
  
  // Implementar efecto parallax al hacer scroll
  useVisibleTask$(({ cleanup }) => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      
      // Aplicar efecto parallax a las imágenes de fondo
      if (missionRef.value) {
        const missionElement = missionRef.value;
        const missionOffset = missionElement.offsetTop;
        const missionDistance = scrollPosition - missionOffset;
        
        if (missionDistance > -500 && missionDistance < 500) {
          const translateY = missionDistance * 0.15;
          missionElement.style.backgroundPositionY = `${translateY}px`;
        }
      }
      
      if (visionRef.value) {
        const visionElement = visionRef.value;
        const visionOffset = visionElement.offsetTop;
        const visionDistance = scrollPosition - visionOffset;
        
        if (visionDistance > -500 && visionDistance < 500) {
          const translateY = visionDistance * 0.1;
          visionElement.style.backgroundPositionY = `${translateY}px`;
        }
      }
    };
    
    // Agregar listener para el evento scroll
    window.addEventListener('scroll', handleScroll);
    
    // Limpiar listener al desmontar el componente
    cleanup(() => {
      window.removeEventListener('scroll', handleScroll);
    });
  });
  
  return (
    <section id="mission-vision" class="py-16">
      {/* Misión */}
      <div 
        ref={missionRef}
        class="min-h-[60vh] bg-fixed bg-center bg-cover flex items-center relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)'
        }}
      >
        {/* Overlay para mejorar legibilidad */}
        <div class="absolute inset-0 bg-gradient-to-r from-[#FF6B6B99] to-[#FF6B6B30]"></div>
        
        <div class="container mx-auto px-4 relative z-10">
          <div class="max-w-2xl ml-auto mr-0 bg-white bg-opacity-90 p-8 rounded-lg shadow-xl">
            <h2 class="text-3xl font-bold mb-4 text-[#FF6B6B]">Nuestra Misión</h2>
            <p class="text-lg mb-4">
              En TUIKIGAI nos dedicamos a ayudar a las personas a descubrir su propósito 
              de vida mediante la intersección de sus pasiones, talentos, 
              necesidades del mundo y oportunidades económicas.
            </p>
            <p class="text-lg">
              Creemos que cada persona tiene un propósito único que, cuando se descubre y 
              desarrolla, no solo trae realización personal sino que también contribuye 
              significativamente al bienestar colectivo.
            </p>
          </div>
        </div>
      </div>
      
      {/* Equipo */}
      <div class="container mx-auto px-4 py-16">
        <h2 class="text-3xl font-bold mb-12 text-center">Nuestro Equipo</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Miembro del equipo 1 */}
          <div class="text-center">
            <div class="mb-4 relative mx-auto w-40 h-40 overflow-hidden rounded-full border-4 border-[#4ECDC4]">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" 
                alt="Miembro del equipo" 
                class="w-full h-full object-cover"
              />
            </div>
            <h3 class="text-xl font-bold">Ana García</h3>
            <p class="text-[#4ECDC4] font-medium">Fundadora & Coach Ikigai</p>
            <p class="mt-2 text-gray-600 px-4">
              Especialista en desarrollo personal con más de 10 años ayudando a personas a encontrar su propósito.
            </p>
          </div>
          
          {/* Miembro del equipo 2 */}
          <div class="text-center">
            <div class="mb-4 relative mx-auto w-40 h-40 overflow-hidden rounded-full border-4 border-[#FFD93D]">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" 
                alt="Miembro del equipo" 
                class="w-full h-full object-cover"
              />
            </div>
            <h3 class="text-xl font-bold">Carlos Ramírez</h3>
            <p class="text-[#FFD93D] font-medium">Coach de Carrera</p>
            <p class="mt-2 text-gray-600 px-4">
              Experto en orientación vocacional y desarrollo profesional con enfoque en fortalezas personales.
            </p>
          </div>
          
          {/* Miembro del equipo 3 */}
          <div class="text-center">
            <div class="mb-4 relative mx-auto w-40 h-40 overflow-hidden rounded-full border-4 border-[#FF6B6B]">
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80" 
                alt="Miembro del equipo" 
                class="w-full h-full object-cover"
              />
            </div>
            <h3 class="text-xl font-bold">Laura Mendoza</h3>
            <p class="text-[#FF6B6B] font-medium">Psicóloga Organizacional</p>
            <p class="mt-2 text-gray-600 px-4">
              Especialista en bienestar laboral y alineación de valores personales con objetivos profesionales.
            </p>
          </div>
        </div>
      </div>
      
      {/* Visión */}
      <div 
        ref={visionRef}
        class="min-h-[60vh] bg-fixed bg-center bg-cover flex items-center relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80)'
        }}
      >
        {/* Overlay para mejorar legibilidad */}
        <div class="absolute inset-0 bg-gradient-to-l from-[#4ECDC499] to-[#4ECDC430]"></div>
        
        <div class="container mx-auto px-4 relative z-10">
          <div class="max-w-2xl mr-auto ml-0 bg-white bg-opacity-90 p-8 rounded-lg shadow-xl">
            <h2 class="text-3xl font-bold mb-4 text-[#4ECDC4]">Nuestra Visión</h2>
            <p class="text-lg mb-4">
              Aspiramos a crear un mundo donde cada persona viva alineada con su propósito,
              contribuyendo desde sus talentos únicos al bienestar colectivo y creando 
              una sociedad más realizada y sostenible.
            </p>
            <p class="text-lg">
              Para 2025, buscamos haber ayudado a más de 10,000 personas en Latinoamérica 
              a descubrir y desarrollar su Ikigai, transformando vidas y comunidades a través 
              del poder del propósito.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});