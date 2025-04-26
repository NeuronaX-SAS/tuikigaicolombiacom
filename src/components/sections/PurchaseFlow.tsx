import { component$, useStore, useSignal, $ } from '@builder.io/qwik';
import confetti from 'canvas-confetti';
import { type PropFunction } from '@builder.io/qwik';
import { mercadoPagoService, type PreferenceRequest, type MercadoPagoItem } from '../../services/MercadoPagoService';

// Definición de la interfaz de props
interface PurchaseFlowProps {
  state: {
    ikigaiResponses: {
      love: string;
      talent: string;
      need: string;
      payment: string;
    };
    consentAccepted?: boolean;
    captchaToken?: string;
    ui: {
      showPurchaseFlow: boolean;
      currentStep: string;
    };
    purchase: {
      preferenceId: string; // ADDED: To store MP preference ID
      giftCode: string;
      type: string;
      completed: boolean;
    };
    user: {
      name: string;
      email: string;
    };
    recipient: {
      name: string;
      email: string;
    };
  };
  onComplete$: PropFunction<() => void>;
}

// Interfaz para el estado interno del componente
interface PurchaseState {
  step: number;
  loading: boolean;
  error: string;
  success: boolean;
  purchaseType: 'self' | 'gift' | 'redeem';
  formData: {
    buyerName: string;
    buyerEmail: string;
    giftCode: string;
    buyerAddress: string;
    buyerTaxId: string;
    recipientName: string;
    recipientEmail: string;
  };
}

/**
 * Componente PurchaseFlow - Gestiona los flujos de compra y canje
 * Permite adquirir la experiencia para sí mismo, regalar a otro o canjear un código
 */
export default component$<PurchaseFlowProps>(({ state, onComplete$ }) => {
  // Estado interno del componente
  const purchaseState = useStore<PurchaseState>({
    step: 1,
    loading: false,
    error: '',
    success: false,
    purchaseType: 'self', // 'self', 'gift', 'redeem'
    formData: {
      buyerName: '',
      buyerEmail: '',
      giftCode: '',
      buyerAddress: '', // Keep for potential future use, but MP might collect it
      buyerTaxId: '',   // Keep for potential future use, but MP might collect it
      recipientName: '',
      recipientEmail: ''
    }
  });

  // Precios de productos (Asegúrate que estos sean los correctos para MP)
  const PRICES = {
    self: 99000, // COP
    gift: 109000 // COP
  };

  // Función para cambiar entre tipos de compra
  const setPurchaseType = $((type: 'self' | 'gift' | 'redeem') => {
    purchaseState.purchaseType = type;
    purchaseState.error = '';
  });

  // Función para avanzar al siguiente paso
  const nextStep = $(() => {
    if (purchaseState.step === 1) {
      // Validar formulario del paso 1
      if (!validateStep1()) {
        return;
      }
    }

    purchaseState.step++;
  });

  // Función para retroceder al paso anterior
  const prevStep = $(() => {
    purchaseState.step--;
    purchaseState.error = '';
  });

  // Validar datos del primer paso
  const validateStep1 = $(() => {
    let isValid = true;
    purchaseState.error = '';

    // Validar según el tipo de compra
    if (purchaseState.purchaseType === 'redeem') {
      // Validar código de regalo
      if (!purchaseState.formData.giftCode) {
        purchaseState.error = 'Por favor, ingresa un código de regalo válido';
        isValid = false;
      } else if (!purchaseState.formData.giftCode.startsWith('TKG-')) {
        purchaseState.error = 'El código debe comenzar con TKG-';
        isValid = false;
      }

      // Validar datos básicos del usuario
      if (!purchaseState.formData.buyerName || !purchaseState.formData.buyerEmail) {
        purchaseState.error = 'Por favor, completa tu nombre y correo electrónico';
        isValid = false;
      } else if (!validateEmail(purchaseState.formData.buyerEmail)) {
        purchaseState.error = 'Por favor, ingresa un correo electrónico válido';
        isValid = false;
      }

    } else if (purchaseState.purchaseType === 'gift') {
      // Validar datos del comprador
      if (!purchaseState.formData.buyerName || !purchaseState.formData.buyerEmail) {
        purchaseState.error = 'Por favor, completa tus datos de contacto';
        isValid = false;
      } else if (!validateEmail(purchaseState.formData.buyerEmail)) {
        purchaseState.error = 'Por favor, ingresa un correo electrónico válido';
        isValid = false;
      }

      // Validar datos del destinatario
      if (!purchaseState.formData.recipientName || !purchaseState.formData.recipientEmail) {
        purchaseState.error = 'Por favor, completa los datos del destinatario';
        isValid = false;
      } else if (!validateEmail(purchaseState.formData.recipientEmail)) {
        purchaseState.error = 'Por favor, ingresa un correo electrónico válido para el destinatario';
        isValid = false;
      }

    } else { // type === 'self'
      // Validar datos del comprador
      if (!purchaseState.formData.buyerName || !purchaseState.formData.buyerEmail) {
        purchaseState.error = 'Por favor, completa tus datos de contacto';
        isValid = false;
      } else if (!validateEmail(purchaseState.formData.buyerEmail)) {
        purchaseState.error = 'Por favor, ingresa un correo electrónico válido';
        isValid = false;
      }
    }

    return isValid;
  });

  // Validar formato de email
  const validateEmail = $((email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  });

  // Procesar la transacción
  const processTransaction = $(async () => {
    purchaseState.loading = true;
    purchaseState.error = '';

    try {
      // Si es redención de código, procesamos de forma separada
      if (purchaseState.purchaseType === 'redeem') {
        // Aquí iría la lógica para verificar el código con su propio servicio
        // Por ahora simulamos un éxito para propósitos de demo
        await new Promise(resolve => setTimeout(resolve, 1000));

        purchaseState.success = true;

        // Lanzar confeti para celebrar
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        return;
      }

      // --- Integración con Mercado Pago ---
      const items: MercadoPagoItem[] = [
        {
          title: purchaseState.purchaseType === 'self'
            ? 'Tu análisis de Ikigai personalizado'
            : 'Regalo de análisis de Ikigai personalizado',
          quantity: 1,
          unit_price: purchaseState.purchaseType === 'self' ? PRICES.self : PRICES.gift,
          currency_id: 'COP' // Asegúrate que sea la moneda correcta
        }
      ];

      const preferenceRequest: PreferenceRequest = {
        items: items,
        payer: {
          email: purchaseState.formData.buyerEmail,
          name: purchaseState.formData.buyerName
          // Consider adding more payer details if needed/available
        },
        // back_urls are set by the backend in this setup
        // auto_return is set by the backend
        external_reference: `tuikigai_${purchaseState.purchaseType}_${Date.now()}` // Example reference
      };

      // Add recipient info to metadata if it's a gift (optional, but can be useful)
      // Note: MP Preferences don't have a dedicated recipient field, use metadata or external_reference
      if (purchaseState.purchaseType === 'gift') {
        // You might encode this in external_reference or handle it post-payment
        console.log("Gift purchase for:", purchaseState.formData.recipientEmail);
      }

      console.log("Creating Mercado Pago preference with data:", preferenceRequest);
      const preferenceResponse = await mercadoPagoService.createPreference(preferenceRequest);

      if (preferenceResponse && preferenceResponse.init_point) {
        console.log("Preference created:", preferenceResponse.id);
        console.log("Redirecting to Mercado Pago:", preferenceResponse.init_point);

        // Guardar información relevante (opcional, depende de tu flujo post-pago)
        state.purchase.preferenceId = preferenceResponse.id;
        state.purchase.type = purchaseState.purchaseType;
        state.user.name = purchaseState.formData.buyerName;
        state.user.email = purchaseState.formData.buyerEmail;
        if (purchaseState.purchaseType === 'gift') {
          state.recipient.name = purchaseState.formData.recipientName;
          state.recipient.email = purchaseState.formData.recipientEmail;
        }

        // Redirect user to Mercado Pago checkout
        window.location.href = preferenceResponse.init_point;
        // No need to advance step or set success here, MP handles the flow

      } else {
        console.error('Error creating Mercado Pago preference.');
        purchaseState.error = mercadoPagoService.getLastError()?.message || 'No se pudo iniciar el proceso de pago. Intenta de nuevo.';
      }
      // --- Fin Integración Mercado Pago ---

    } catch (error) {
      console.error('Error en el procesamiento del pago:', error);
      purchaseState.error = error instanceof Error ? error.message : 'Error al procesar la transacción';
    } finally {
      purchaseState.loading = false;
    }
  });

  // Finalizar el proceso de compra (This might need adjustment depending on how you handle post-payment)
  // This function might now be triggered by the success/failure/pending routes from Mercado Pago
  const finishPurchase = $(() => {
    // Almacenar datos en el estado global
    state.user.name = purchaseState.formData.buyerName;
    state.user.email = purchaseState.formData.buyerEmail;

    if (purchaseState.purchaseType === 'gift') {
      state.recipient.name = purchaseState.formData.recipientName;
      state.recipient.email = purchaseState.formData.recipientEmail;
    }

    state.purchase.type = purchaseState.purchaseType;
    state.purchase.completed = true; // Mark as completed

    // Llamar a la función proporcionada por el componente padre
    onComplete$();

    // Lanzar confeti para celebrar
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  });

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-4 sm:p-6 md:p-8 animate-fadein max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div class="mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">
            Elegir experiencia TUIKIGAI
          </h2>

          {/* Barra de progreso - Adjusted to 2 steps before MP redirection */}
          {purchaseState.step < 3 && (
            <div class="mt-4">
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] transition-all duration-300"
                  style={{ width: `${(purchaseState.step / 2) * 100}%` }}
                ></div>
              </div>
              <div class="flex justify-between mt-2 text-xs sm:text-sm text-gray-500">
                <span>Elegir</span>
                <span>Datos</span>
                <span>Pagar</span> {/* ADDED */}
              </div>
            </div>
          )}
        </div>

        {/* Paso 1: Selección de tipo de compra y datos básicos */}
        {purchaseState.step === 1 && (
          <div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Opción: Comprar para mí */}
              <div 
                class={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md 
                       ${purchaseState.purchaseType === 'self' ? 'border-[#4ECDC4] bg-[#4ECDC410]' : 'border-gray-200'}`}
                onClick$={() => setPurchaseType('self')}
              >
                <h3 class="font-bold text-sm sm:text-base mb-1 sm:mb-2">Para mí</h3>
                <p class="text-xs sm:text-sm mb-2 sm:mb-4">Adquiere tu experiencia Ikigai personalizada</p>
                <p class="font-bold text-sm sm:text-lg">${PRICES.self.toLocaleString('es-CO')} COP</p>
                <p class="text-xs text-gray-500">IVA incluido</p>
              </div>
              
              {/* Opción: Regalar */}
              <div 
                class={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md 
                       ${purchaseState.purchaseType === 'gift' ? 'border-[#4ECDC4] bg-[#4ECDC410]' : 'border-gray-200'}`}
                onClick$={() => setPurchaseType('gift')}
              >
                <h3 class="font-bold text-sm sm:text-base mb-1 sm:mb-2">Regalar</h3>
                <p class="text-xs sm:text-sm mb-2 sm:mb-4">Obsequia propósito a alguien especial</p>
                <p class="font-bold text-sm sm:text-lg">${PRICES.gift.toLocaleString('es-CO')} COP</p>
                <p class="text-xs text-gray-500">IVA incluido</p>
              </div>
              
              {/* Opción: Canjear código */}
              <div 
                class={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md 
                       ${purchaseState.purchaseType === 'redeem' ? 'border-[#4ECDC4] bg-[#4ECDC410]' : 'border-gray-200'}`}
                onClick$={() => setPurchaseType('redeem')}
              >
                <h3 class="font-bold text-sm sm:text-base mb-1 sm:mb-2">Canjear código</h3>
                <p class="text-xs sm:text-sm mb-2 sm:mb-4">Usa un código de regalo que recibiste</p>
                <p class="font-bold text-sm sm:text-lg">Gratis</p>
                <p class="text-xs text-gray-500">Con código válido</p>
              </div>
            </div>
            
            <div class="mb-4 sm:mb-6">
              <h3 class="font-bold text-sm sm:text-base mb-2 sm:mb-3">Completa tu información</h3>
              
              {/* Campos según tipo de compra */}
              <div class="space-y-3 sm:space-y-4">
                {/* Campos comunes */}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label for="buyerName" class="block text-sm font-medium mb-1">
                      Tu nombre<span class="text-red-500">*</span>
                    </label>
                    <input 
                      id="buyerName"
                      type="text" 
                      class="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                      value={purchaseState.formData.buyerName}
                      onChange$={(e: Event) => purchaseState.formData.buyerName = (e.target as HTMLInputElement).value}
                    />
                  </div>
                  <div>
                    <label for="buyerEmail" class="block text-sm font-medium mb-1">
                      Tu correo electrónico<span class="text-red-500">*</span>
                    </label>
                    <input 
                      id="buyerEmail"
                      type="email" 
                      class="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                      value={purchaseState.formData.buyerEmail}
                      onChange$={(e: Event) => purchaseState.formData.buyerEmail = (e.target as HTMLInputElement).value}
                    />
                  </div>
                </div>
                
                {/* Campo específico para canjear código */}
                {purchaseState.purchaseType === 'redeem' && (
                  <div>
                    <label for="giftCode" class="block text-sm font-medium mb-1">
                      Código de regalo<span class="text-red-500">*</span>
                    </label>
                    <input 
                      id="giftCode"
                      type="text" 
                      class="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                      placeholder="TKG-XXXXXX"
                      value={purchaseState.formData.giftCode}
                      onChange$={(e: Event) => purchaseState.formData.giftCode = (e.target as HTMLInputElement).value}
                    />
                    <p class="text-xs text-gray-500 mt-1">Introduce el código que recibiste (formato: TKG-XXXXXX)</p>
                  </div>
                )}
                
                {/* Campos específicos para regalo */}
                {purchaseState.purchaseType === 'gift' && (
                  <>
                    <div>
                      <label for="recipientName" class="block text-sm font-medium mb-1">
                        Nombre del destinatario<span class="text-red-500">*</span>
                      </label>
                      <input 
                        id="recipientName"
                        type="text" 
                        class="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                        value={purchaseState.formData.recipientName}
                        onChange$={(e: Event) => purchaseState.formData.recipientName = (e.target as HTMLInputElement).value}
                      />
                    </div>
                    <div>
                      <label for="recipientEmail" class="block text-sm font-medium mb-1">
                        Correo electrónico del destinatario<span class="text-red-500">*</span>
                      </label>
                      <input 
                        id="recipientEmail"
                        type="email" 
                        class="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                        value={purchaseState.formData.recipientEmail}
                        onChange$={(e: Event) => purchaseState.formData.recipientEmail = (e.target as HTMLInputElement).value}
                      />
                      <p class="text-xs text-gray-500 mt-1">Se enviará un correo con el código de regalo</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mensaje de error */}
            {purchaseState.error && (
              <div class="mb-4 p-2 sm:p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                {purchaseState.error}
              </div>
            )}

            {/* Botones */}
            <div class="flex justify-end gap-2 sm:gap-3">
              <button
                class="px-3 py-2 sm:px-4 sm:py-3 bg-gray-200 text-gray-800 rounded-lg text-sm sm:text-base hover:bg-gray-300 transition-colors"
                onClick$={() => {
                  state.ui.showPurchaseFlow = false;
                  state.ui.currentStep = 'ikigai';
                }}
              >
                Cancelar
              </button>
              {purchaseState.purchaseType === 'redeem' ? (
                <button
                  class="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white rounded-lg text-sm sm:text-base hover:shadow-md transition-all"
                  onClick$={processTransaction} // Redeem still uses processTransaction
                  disabled={purchaseState.loading}
                >
                  {purchaseState.loading ? 'Procesando...' : 'Canjear código'}
                </button>
              ) : (
                <button
                  class="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white rounded-lg text-sm sm:text-base hover:shadow-md transition-all"
                  onClick$={nextStep} // Go to step 2 (billing details)
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Paso 2: Datos de facturación (opcional, MP puede recogerlos) y Resumen */}
        {purchaseState.step === 2 && (
          <div class="space-y-4">
            {/* Puede ser opcional o simplificado si MP recoge esta info */}
            <div class="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
              <h3 class="font-bold text-sm sm:text-base mb-2 sm:mb-3">Datos de facturación</h3>
              <p class="text-xs sm:text-sm text-gray-600 mb-3">
                Esta información es importante para generar tu factura correctamente.
              </p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label for="buyerAddress" class="block text-sm font-medium mb-1">Dirección</label>
                  <input 
                    id="buyerAddress"
                    type="text" 
                    class="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                    placeholder="Tu dirección"
                    value={purchaseState.formData.buyerAddress}
                    onChange$={(e: Event) => purchaseState.formData.buyerAddress = (e.target as HTMLInputElement).value}
                  />
                </div>
                <div>
                  <label for="buyerTaxId" class="block text-sm font-medium mb-1">NIT/CC</label>
                  <input 
                    id="buyerTaxId"
                    type="text" 
                    class="w-full p-2 sm:p-3 border border-gray-300 rounded-md"
                    placeholder="Identificación fiscal"
                    value={purchaseState.formData.buyerTaxId}
                    onChange$={(e: Event) => purchaseState.formData.buyerTaxId = (e.target as HTMLInputElement).value}
                  />
                </div>
              </div>
            </div>

            {/* Resumen de compra */}
            <div class="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <h4 class="font-bold text-blue-800 text-sm sm:text-base mb-2">Resumen de compra</h4>
              <p class="flex justify-between mb-1 text-sm">
                <span>Experiencia TUIKIGAI {purchaseState.purchaseType === 'gift' ? '(Regalo)' : '(Personal)'}</span>
                <span>${(purchaseState.purchaseType === 'gift' ? PRICES.gift : PRICES.self).toLocaleString('es-CO')} COP</span>
              </p>
              <p class="text-xs text-gray-600">IVA incluido</p>
              <hr class="my-2 border-blue-200"/>
              <p class="flex justify-between font-bold text-sm sm:text-base">
                 <span>Total</span>
                 <span>${(purchaseState.purchaseType === 'gift' ? PRICES.gift : PRICES.self).toLocaleString('es-CO')} COP</span>
              </p>
            </div>

            {/* Mensaje de error */}
            {purchaseState.error && (
              <div class="mb-4 p-2 sm:p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                {purchaseState.error}
              </div>
            )}

            {/* Botones */}
            <div class="flex justify-between gap-2 sm:gap-3">
              <button
                class="px-3 py-2 sm:px-4 sm:py-3 bg-gray-200 text-gray-800 rounded-lg text-sm sm:text-base hover:bg-gray-300 transition-colors"
                onClick$={prevStep}
              >
                Volver
              </button>
              
              <button
                class="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white rounded-lg text-sm sm:text-base hover:shadow-md transition-all"
                onClick$={processTransaction}
                disabled={purchaseState.loading}
              >
                {purchaseState.loading ? 'Procesando...' : 'Proceder al pago'}
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Procesando/Éxito (puede ser redireccionado a MP antes de llegar aquí) */}
        {purchaseState.step === 3 && (
          <div class="py-4 sm:py-6 text-center">
            {purchaseState.success ? (
              // Éxito - podría mostrarse antes de redirigir al usuario
              <div class="space-y-4 sm:space-y-6">
                <div class="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 sm:h-12 sm:w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 class="text-lg sm:text-xl font-bold">¡Transacción exitosa!</h3>
                <p class="text-sm sm:text-base text-gray-600">Tu compra se ha realizado correctamente.</p>
                
                <div class="mt-6">
                  <button
                    class="px-5 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#4ECDC4] to-[#4ECDC4] text-white rounded-lg text-sm sm:text-base hover:shadow-md transition-all"
                    onClick$={onComplete$}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            ) : (
              // Procesando - spinners y mensajes mientras se procesa el pago
              <div class="space-y-4 sm:space-y-6">
                <div class="mx-auto w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
                <h3 class="text-lg sm:text-xl font-bold">Procesando</h3>
                <p class="text-sm sm:text-base text-gray-600">Estamos procesando tu solicitud...</p>
                
                {purchaseState.error && (
                  <div class="bg-red-100 p-3 mx-auto max-w-md rounded-lg text-red-700 text-sm mt-4">
                    {purchaseState.error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});