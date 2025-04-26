import { component$, useSignal, $, type PropFunction, useVisibleTask$ } from '@builder.io/qwik';

// Definición de tipos para props
interface ConsentGateProps {
  state: {
    consentAccepted?: boolean;
    captchaToken?: string;
  };
  onAccept$: PropFunction<() => void>;
  onDecline$: PropFunction<() => void>;
}

/**
 * Componente ConsentGate - Solicitud de consentimiento para tratamiento de datos personales
 * Cumple con los requisitos de la Ley 1581 de 2012 (Colombia)
 */
export default component$<ConsentGateProps>(({ state, onAccept$, onDecline$ }) => {
  const consentChecked = useSignal(false);
  const captchaVerified = useSignal(false);
  const captchaToken = useSignal('');
  const isDevelopment = useSignal(import.meta.env.DEV);

  // En desarrollo, automatizar la verificación del captcha
  useVisibleTask$(() => {
    if (isDevelopment.value) {
      captchaVerified.value = true;
      captchaToken.value = 'development-test-token';
    }
  });

  // Función llamada cuando el captcha es resuelto por el usuario
  const onCaptchaVerified = $((token: string) => {
    captchaVerified.value = true;
    captchaToken.value = token;
  });

  // Función para continuar después del consentimiento
  const handleContinue = $(() => {
    if (!consentChecked.value) {
      alert('Debes aceptar la política de tratamiento de datos personales para continuar.');
      return;
    }
    
    if (!captchaVerified.value && !isDevelopment.value) {
      alert('Por favor, completa la verificación de seguridad.');
      return;
    }
    
    // Guardar el estado del consentimiento
    state.consentAccepted = true;
    state.captchaToken = captchaToken.value;
    
    // Llamar a la función proporcionada por el componente padre
    onAccept$();
  });

  // Función para rechazar y volver
  const handleCancel = $(() => {
    onDecline$();
  });

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 md:p-8 animate-fadein">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Consentimiento de Tratamiento de Datos</h2>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-6 max-h-[300px] overflow-y-auto text-sm">
          <h3 class="font-bold mb-2">Política de Tratamiento de Datos Personales</h3>
          <p class="mb-3">De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, solicitamos su autorización para que NeuronaX S.A.S. realice el tratamiento de sus datos personales.</p>
          
          <h4 class="font-bold mt-4 mb-1">1. Responsable del Tratamiento</h4>
          <p>NeuronaX S.A.S., identificada con NIT [Número], con domicilio en [Dirección], Colombia.</p>
          
          <h4 class="font-bold mt-4 mb-1">2. Finalidad del Tratamiento</h4>
          <p>Sus datos personales serán utilizados para:</p>
          <ul class="list-disc pl-5 my-2 space-y-1">
            <li>Generar su diagrama Ikigai personalizado</li>
            <li>Procesar pagos y emitir facturas electrónicas</li>
            <li>Enviar información relacionada con nuestros servicios</li>
            <li>Mejorar su experiencia con nuestros productos</li>
          </ul>
          
          <h4 class="font-bold mt-4 mb-1">3. Derechos del Titular</h4>
          <p>Como titular de los datos, usted tiene derecho a:</p>
          <ul class="list-disc pl-5 my-2 space-y-1">
            <li>Conocer, actualizar y rectificar sus datos personales</li>
            <li>Solicitar prueba de la autorización otorgada</li>
            <li>Ser informado sobre el uso que se ha dado a sus datos</li>
            <li>Revocar la autorización y/o solicitar la supresión de sus datos</li>
            <li>Acceder gratuitamente a sus datos personales</li>
          </ul>
          
          <h4 class="font-bold mt-4 mb-1">4. Mecanismos para ejercer derechos</h4>
          <p>Para ejercer sus derechos, puede contactarnos a través de:</p>
          <ul class="list-disc pl-5 my-2 space-y-1">
            <li>Correo electrónico: privacidad@tuikigai.co</li>
            <li>Dirección física: [Dirección]</li>
          </ul>
        </div>
        
        {/* Casilla de consentimiento */}
        <div class="mb-6">
          <label class="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              class="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              checked={consentChecked.value}
              onChange$={(e: Event) => {
                const target = e.target as HTMLInputElement;
                consentChecked.value = target.checked;
              }}
            />
            <span>
              <strong>Acepto la Política de Tratamiento de Datos Personales</strong> y autorizo a NeuronaX S.A.S. para recolectar, almacenar, usar y circular mis datos personales conforme a la política anterior.
            </span>
          </label>
        </div>
        
        {/* Captcha de Cloudflare Turnstile - solo mostrar en producción */}
        {!isDevelopment.value && (
          <div class="mb-6 flex justify-center">
            <div 
              class="cf-turnstile" 
              data-sitekey="1x00000000000000000000AA" 
              data-callback={onCaptchaVerified}
            ></div>
          </div>
        )}
        
        {/* Botones de acción */}
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button 
            onClick$={handleCancel}
            class="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            onClick$={handleContinue}
            class="btn-primary"
            disabled={!consentChecked.value || (!captchaVerified.value && !isDevelopment.value)}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
});