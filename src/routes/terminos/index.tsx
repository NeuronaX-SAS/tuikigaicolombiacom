import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="bg-white min-h-screen py-16">
      <div class="container mx-auto px-4 max-w-4xl">
        <h1 class="text-3xl md:text-4xl font-bold text-center mb-10 text-tuikigai-navy">
          Términos y Condiciones
        </h1>
        
        <div class="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div class="prose prose-lg max-w-none">
            <h2 class="text-xl font-semibold mb-4">1. Introducción</h2>
            <p>
              Al acceder y utilizar nuestro servicio TUIKIGAI, usted acepta quedar vinculado por estos términos 
              y condiciones de uso. Si no está de acuerdo con todos estos términos, no debe utilizar nuestro servicio.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">2. Descripción del Servicio</h2>
            <p>
              TUIKIGAI es una plataforma digital que ofrece herramientas para el descubrimiento del propósito personal
              basado en el concepto japonés del Ikigai. Nuestros servicios incluyen, pero no se limitan a:
            </p>
            <ul class="list-disc pl-5 my-4 space-y-2">
              <li>Creación de diagramas Ikigai personalizados</li>
              <li>Visualización de plantillas de Ikigai en diferentes colores</li>
              <li>Almacenamiento de sus respuestas para su posterior consulta</li>
              <li>Acceso a recursos educativos sobre el concepto Ikigai</li>
            </ul>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">3. Uso del Servicio</h2>
            <p>
              Usted acepta utilizar nuestro servicio solo con fines legales y de una manera que no infrinja los derechos de,
              restrinja o inhiba el uso y disfrute del servicio por parte de cualquier tercero.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">4. Propiedad Intelectual</h2>
            <p>
              Todo el contenido incluido en TUIKIGAI, como texto, gráficos, logotipos, iconos, imágenes, clips de audio,
              descargas digitales y compilaciones de datos, es propiedad de NeuronaX S.A.S. y está protegido por las leyes 
              de propiedad intelectual.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">5. Pagos y Reembolsos</h2>
            <p>
              Al realizar un pago por nuestros servicios premium, usted acepta proporcionar información precisa y completa.
              Las políticas de reembolso se aplicarán de acuerdo con las leyes colombianas de protección al consumidor.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">6. Privacidad</h2>
            <p>
              Su uso de nuestro servicio está sujeto a nuestra Política de Privacidad. Al utilizar TUIKIGAI, 
              usted consiente la recopilación y uso de la información como se describe en nuestra Política de Privacidad.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones 
              entrarán en vigor inmediatamente después de su publicación. El uso continuado del servicio después de 
              la publicación de modificaciones constituirá su aceptación de dichas modificaciones.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">8. Contacto</h2>
            <p>
              Si tiene preguntas sobre estos términos y condiciones, puede contactarnos en:
              <br /><a href="mailto:tuikigaicolombia@gmail.com" class="text-tuikigai-teal hover:underline">tuikigaicolombia@gmail.com</a>
              <br />Teléfono: +57 315 070 3733
            </p>
            
            <p class="mt-8 text-sm text-gray-500">
              Última actualización: Abril 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Términos y Condiciones - TUIKIGAI',
  meta: [
    {
      name: 'description',
      content: 'Términos y condiciones de uso de la plataforma TUIKIGAI',
    },
  ],
}; 