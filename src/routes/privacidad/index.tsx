import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <div class="bg-white min-h-screen py-16">
      <div class="container mx-auto px-4 max-w-4xl">
        <h1 class="text-3xl md:text-4xl font-bold text-center mb-10 text-tuikigai-navy">
          Política de Tratamiento de Datos Personales
        </h1>
        
        <div class="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div class="prose prose-lg max-w-none">
            <p class="font-medium text-gray-600">
              En cumplimiento con lo dispuesto en la Ley 1581 de 2012 y el Decreto 1377 de 2013, 
              NeuronaX S.A.S., ha desarrollado la siguiente política para el tratamiento de datos 
              personales recolectados en el desarrollo de sus actividades.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">1. Responsable del Tratamiento</h2>
            <p>
              NeuronaX S.A.S., identificada con NIT 900.XXX.XXX-X, con domicilio en Bogotá, Colombia, 
              es responsable del tratamiento de los datos personales obtenidos a través de la plataforma TUIKIGAI.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">2. Finalidad del Tratamiento</h2>
            <p>
              Los datos personales que recolectamos serán utilizados para los siguientes fines:
            </p>
            <ul class="list-disc pl-5 my-4 space-y-2">
              <li>Generar su diagrama Ikigai personalizado</li>
              <li>Almacenar sus respuestas para la generación y visualización de su Ikigai</li>
              <li>Procesar pagos y emitir facturas por nuestros servicios</li>
              <li>Enviar información relacionada con nuestros servicios</li>
              <li>Mejorar y personalizar su experiencia con nuestros productos</li>
              <li>Realizar análisis estadísticos para mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">3. Datos Recolectados</h2>
            <p>
              Para los fines mencionados, podemos recolectar los siguientes datos:
            </p>
            <ul class="list-disc pl-5 my-4 space-y-2">
              <li>Información de contacto: nombre, correo electrónico, número telefónico</li>
              <li>Información de identificación: tipo y número de documento</li>
              <li>Información de pago: datos necesarios para procesar transacciones</li>
              <li>Respuestas proporcionadas en el proceso de creación del Ikigai</li>
            </ul>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">4. Derechos del Titular</h2>
            <p>
              Como titular de los datos personales, usted tiene los siguientes derechos:
            </p>
            <ul class="list-disc pl-5 my-4 space-y-2">
              <li>Conocer, actualizar y rectificar sus datos personales</li>
              <li>Solicitar prueba de la autorización otorgada para el tratamiento de sus datos</li>
              <li>Ser informado sobre el uso que se ha dado a sus datos personales</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio</li>
              <li>Revocar la autorización y/o solicitar la supresión de sus datos</li>
              <li>Acceder de forma gratuita a sus datos personales</li>
            </ul>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">5. Procedimiento para Ejercer Derechos</h2>
            <p>
              Para ejercer sus derechos, puede contactarnos a través de:
            </p>
            <ul class="list-disc pl-5 my-4 space-y-2">
              <li>Correo electrónico: <a href="mailto:tuikigaicolombia@gmail.com" class="text-tuikigai-teal hover:underline">tuikigaicolombia@gmail.com</a></li>
              <li>Teléfono: +57 315 070 3733</li>
            </ul>
            <p>
              Su solicitud será atendida en un plazo máximo de diez (10) días hábiles contados a partir de la fecha de recibo.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">6. Seguridad de la Información</h2>
            <p>
              Implementamos medidas técnicas, administrativas y organizacionales para proteger sus datos 
              personales contra acceso no autorizado, pérdida, alteración o divulgación.
            </p>
            
            <h2 class="text-xl font-semibold mb-4 mt-8">7. Vigencia</h2>
            <p>
              Esta política de tratamiento de datos personales está vigente desde abril de 2025 y 
              permanecerá vigente mientras exista una relación contractual con el titular o mientras 
              sea necesario para cumplir con obligaciones legales.
            </p>
            
            <p class="mt-8 text-sm text-gray-600">
              TUIKIGAI cumple con los estándares de protección de datos personales establecidos por la 
              <a href="https://www.sic.gov.co/tema/proteccion-de-datos-personales" target="_blank" rel="noopener noreferrer" class="text-tuikigai-teal hover:underline ml-1">
                Superintendencia de Industria y Comercio
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Política de Tratamiento de Datos - TUIKIGAI',
  meta: [
    {
      name: 'description',
      content: 'Política de tratamiento de datos personales de TUIKIGAI',
    },
  ],
}; 