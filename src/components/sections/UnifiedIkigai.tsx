import { component$, useSignal, useStore, $, useVisibleTask$ } from '@builder.io/qwik';
import IkigaiDiagram from '../ui/IkigaiDiagram';
import IkigaiCard from '../ui/IkigaiCard';
import { getAssetPath } from '../../utils/assetPath';

// Importar servicios
import { mercadoPagoService } from '../../services/MercadoPagoService';
import { firestoreService } from '../../services/FirestoreService';

// import { API } from '../../services/api'; // Comentado si no se usa directamente

interface UnifiedIkigaiState {
  ikigaiResponses: {
    love: string;
    talent: string;
    need: string;
    payment: string;
  };
  convergenceIndex: number;
  userName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  progress: number;
  currentStep: number;
}

export default component$(() => {
  // Estado global unificado
  const state = useStore<UnifiedIkigaiState>({
    ikigaiResponses: { love: '', talent: '', need: '', payment: '' },
    convergenceIndex: 0, userName: '', acceptTerms: false, acceptPrivacy: false, progress: 0, currentStep: 0
  });

  // Estados para la UI
  const expandedCard = useSignal<string | null>('love'); // Comenzamos con la primera tarjeta expandida
  const svgRef = useSignal<SVGSVGElement>();
  const showPurchaseModal = useSignal(false);
  const containerRef = useSignal<HTMLDivElement>();
  const hasNavigatedToNext = useStore({ love: false, talent: false, need: false, payment: false });

  // Estado para las imágenes de ikigai prediseñadas
  const selectedIkigaiImage = useSignal<string>(getAssetPath('images/IKIGAI_Verde.png'));
  const showStaticIkigai = useSignal(true);
  const showRealTimeOption = useSignal(false); // Nuevo estado para controlar la visibilidad de la opción "Tiempo Real"

  // Contadores de caracteres
  const characterCounts = useStore({ love: 0, talent: 0, need: 0, payment: 0 });

  // Estados adicionales para el proceso de compra
  const purchaseOption = useSignal<'personal' | 'gift' | 'code' | null>(null);
  const showPaymentModal = useSignal(false);
  const paymentStep = useSignal('details'); 
  const isProcessingPayment = useSignal(false);
  const isSubmitting = useSignal(false); // New state to track form submission loading state
  const paymentError = useSignal('');

  // State for purchase data
  const purchaseData = useStore({ 
    email: '', 
    name: '', 
    giftEmail: '', 
    giftMessage: '', 
    promoCode: '', 
    orderNumber: '',
    // Campos adicionales para Firestore
    lastName: '',
    idType: '',
    idNumber: '',
    telephone: '',
    city: '',
    houseAddress: '',
    typePerson: 'natural', // 'natural' | 'juridica'
    company: '',
  });

  // TUIKIGAI slogan for the external banner
  const slogan = "Nuestro propósito es ayudarte a encontrar tú propósito.";
  
  // Estado para controlar la visibilidad de los tooltips informativos
  const showTooltipIkigai = useSignal(false);
  const showTooltipTuIkigai = useSignal(false);

  // Función para alternar la visibilidad de los tooltips
  const toggleTooltip = $((tooltipType: 'ikigai' | 'tuikigai') => {
    if (tooltipType === 'ikigai') {
      showTooltipIkigai.value = !showTooltipIkigai.value;
      showTooltipTuIkigai.value = false; // Cerrar el otro tooltip
    } else {
      showTooltipTuIkigai.value = !showTooltipTuIkigai.value;
      showTooltipIkigai.value = false; // Cerrar el otro tooltip
    }
  });

  // Calcular progreso total y actualizar el diagrama
  useVisibleTask$(({ track }) => {
    track(() => [
      state.ikigaiResponses.love, state.ikigaiResponses.talent, state.ikigaiResponses.need, state.ikigaiResponses.payment,
      state.userName, state.acceptTerms, state.acceptPrivacy
    ]);

    const sections = [state.ikigaiResponses.love, state.ikigaiResponses.talent, state.ikigaiResponses.need, state.ikigaiResponses.payment];
    const completedSections = sections.filter(section => section.trim().length > 0).length;
    const termsProgress = (state.acceptTerms && state.acceptPrivacy) ? 1 : 0;
    const nameProgress = state.userName.trim().length > 0 ? 1 : 0;

    state.progress = ((completedSections / 4) * 0.7 + (termsProgress * 0.2) + (nameProgress * 0.1)) * 100;

    // Calcular índice de convergencia basado en palabras compartidas
    let convergence = (completedSections / 4) * 100;
    state.convergenceIndex = convergence;

    // Actualiza el paso actual para animar la línea de progreso
    state.currentStep = completedSections;
  });

  // Mensajes motivacionales mejorados
  const motivationalMessages = {
    love: [
      "¿Qué actividades amas, te apasionan, te hacen perder la noción del tiempo o disfrutabas profundamente de niño? (escribe varias palabras o frases)",
      //"¿Qué te apasiona tanto que podrías hacerlo durante horas?",
      //"¿Qué actividades te dan energía en lugar de agotarte?"
    ],
    talent: [
      "¿En qué habilidades, capacidades y talentos destacas, resuenan contigo o te han reconocido que tienes? (escribe varias palabras o frases)",
      //"¿En qué destacas naturalmente sin mucho esfuerzo?",
      //"¿Qué tareas realizas mejor que la mayoría de personas?"
    ],
    need: [
      "¿De qué forma deseas servir al mundo, un problema que te gustaría resolver, una necesidad que te vincule o un cambio que deba realizarse? (escribe varias palabras o frases)",
      //"¿Cómo podrías contribuir a mejorar tu comunidad?",
      //"¿Qué necesidades observas que no están siendo atendidas?"
    ],
    payment: [
      "¿Por cuáles actividades puedes ser remunerado actualmente, qué labor u ocupación estarías dispuesto a realizar para ganar más dinero? (escribe varias palabras o frases)",
      //"¿Qué valor económico puedes ofrecer al mercado?",
      //"¿Qué problemas puedes resolver que las personas pagarían por solucionar?"
    ]
  };

  const currentMotivationalIndex = useStore({ love: 0, talent: 0, need: 0, payment: 0 });

  // Función para avanzar al siguiente paso automáticamente
  const advanceToNext = $((currentType: string) => {
    const steps = ['love', 'talent', 'need', 'payment'];
    const currentIndex = steps.indexOf(currentType);

    if (currentIndex < steps.length - 1 && !hasNavigatedToNext[currentType as keyof typeof hasNavigatedToNext]) {
      // Marcar este paso como navegado para evitar múltiples navegaciones
      hasNavigatedToNext[currentType as keyof typeof hasNavigatedToNext] = true;

      // Esperar un momento y luego expandir la siguiente tarjeta
      setTimeout(() => {
        expandedCard.value = steps[currentIndex + 1];
      }, 800);
    }
  });

  // Función para manejar el cambio en las tarjetas
  const handleInputChange = $((type: string, value: string) => {
    state.ikigaiResponses[type as keyof typeof state.ikigaiResponses] = value;
    characterCounts[type as keyof typeof characterCounts] = value.length;
    
    // Eliminamos la navegación automática para que el usuario pueda escribir sin interrupciones
    // Ya no avanzamos automáticamente después de escribir 10 caracteres
  });

  // Función para manejar el envío del formulario
  const handleSubmit = $(async () => {
    // Prevent multiple submissions
    if (isSubmitting.value) {
      return;
    }
    
    isSubmitting.value = true; // Set loading state to true
    
    if (!state.acceptTerms || !state.acceptPrivacy) {
      alert('Por favor acepta los términos y condiciones y la política de tratamiento de datos para continuar.');
      isSubmitting.value = false; // Reset loading state
      return;
    }

    const hasResponses = Object.values(state.ikigaiResponses).some(response => response.trim().length > 0);
    if (!hasResponses) {
      alert('Por favor, completa al menos una de las preguntas del Ikigai para continuar.');
      isSubmitting.value = false; // Reset loading state
      return;
    }

    // Obtener el color seleccionado - Logic inlined here
    let selectedColorName: string;
    const ikigaiTemplates = [
      { id: 'gris', name: 'Gris', color: 'bg-gray-400', path: getAssetPath('images/IKIGAI_Gris.png') },
      { id: 'naranja', name: 'Naranja', color: 'bg-orange-500', path: getAssetPath('images/IKIGAI_Naranja.png') },
      { id: 'rojo', name: 'Rojo', color: 'bg-red-600', path: getAssetPath('images/IKIGAI_Rojo.png') },
      { id: 'verde', name: 'Verde', color: 'bg-green-600', path: getAssetPath('images/IKIGAI_Verde.png') },
      { id: 'azul', name: 'Azul', color: 'bg-blue-600', path: getAssetPath('images/IKIGAI_Azul.png') },
      { id: 'morado', name: 'Morado', color: 'bg-purple-600', path: getAssetPath('images/IKIGAI_Morado.png') },
      { id: 'amarillo', name: 'Amarillo', color: 'bg-yellow-500', path: getAssetPath('images/IKIGAI_Amarillo.png') }
    ];
    const selectedTemplate = ikigaiTemplates.find(
      template => template.path === selectedIkigaiImage.value
    );
    selectedColorName = selectedTemplate ? selectedTemplate.name : 'Verde'; // Default to 'Verde' if not found

    // Guardar las respuestas en Firestore
    try {
      const ikigaiData = { 
        userName: state.userName,
        love: state.ikigaiResponses.love,
        talent: state.ikigaiResponses.talent,
        need: state.ikigaiResponses.need,
        payment: state.ikigaiResponses.payment,
        colorSeleccionado: selectedColorName, // Use the inlined logic result
        timestamp: new Date().toISOString()
      };
      console.log('[handleSubmit] Intentando guardar respuestas del Ikigai:', ikigaiData);
      
      // Guardar en Firestore con los datos disponibles
      const firestoreData = {
        userName: state.userName,
        love: state.ikigaiResponses.love,
        talent: state.ikigaiResponses.talent,
        need: state.ikigaiResponses.need,
        money: state.ikigaiResponses.payment // Mapear payment a money para Firestore
      };
      
      // Usar Object.assign para añadir propiedades extra que el linter no conoce
      // de manera segura
      await firestoreService.saveIkigaiResponses(Object.assign(firestoreData, {
        colorSeleccionado: selectedColorName // Use the inlined logic result
      }));
      
      // Mantener la llamada API original si es necesaria
      try {
        const response = await fetch('/api/save-ikigai', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ikigaiData),
        });

        // Verificar si la llamada al backend fue exitosa
        if (!response.ok) {
          // Si hubo un error en el backend, leer el mensaje si es posible
          let errorMsg = `Error del servidor: ${response.status} ${response.statusText}`;
          try {
            const errorBody = await response.json();
            errorMsg = errorBody.error || errorMsg; 
          } catch (e) {
            // No se pudo parsear el error JSON, usar el texto
          }
          console.error('[handleSubmit] Falló la llamada a /api/save-ikigai:', errorMsg);
          // Opcional: Mostrar un alert al usuario
          // alert(`Hubo un problema al guardar tus respuestas iniciales: ${errorMsg}`); 
          // Podríamos decidir no continuar al modal de compra si esto falla:
          // return; 
        } else {
          console.log('[handleSubmit] Llamada a /api/save-ikigai exitosa.');
        }

      } catch (apiError) {
        console.error('[handleSubmit] Error de red llamando a /api/save-ikigai:', apiError);
        // Opcional: Mostrar un alert al usuario
        // alert(`Hubo un problema de conexión al guardar tus respuestas iniciales.`);
        // return; // Podríamos decidir no continuar
      }
    } catch (error) {
      console.error('[handleSubmit] Error preparando datos para guardar:', error);
    } finally {
      // Mostrar el modal de compra (incluso si falló el guardado inicial, según la lógica actual)
      console.log('[handleSubmit] Mostrando modal de compra.');
      showPurchaseModal.value = true;
      isSubmitting.value = false; // Reset loading state
    }
  });

  // Cambiar el mensaje motivacional
  const rotateMotivationalMessage = $((type: string) => {
    const messagesArray = motivationalMessages[type as keyof typeof motivationalMessages];
    const currentIndex = currentMotivationalIndex[type as keyof typeof currentMotivationalIndex];
    const nextIndex = (currentIndex + 1) % messagesArray.length;
    currentMotivationalIndex[type as keyof typeof currentMotivationalIndex] = nextIndex;
  });

  // Función para manejar la selección de la opción de compra
  const handlePurchaseOption = $((option: 'personal' | 'gift' | 'code') => {
    purchaseOption.value = option;
    paymentStep.value = 'details'; // Reset step when option changes
    paymentError.value = ''; // Clear previous errors

    // Si es código promocional, solo mostramos los campos
    if (option === 'code') {
      return;
    }

    // Para las otras opciones, procedemos al modal de pago
    showPaymentModal.value = true;
  });

  // Función para procesar el pago
  const processPayment = $(async () => {
    if (isProcessingPayment.value) {
      return; 
    }
    isProcessingPayment.value = true;
    paymentError.value = '';
    paymentStep.value = 'processing'; // Show spinner while getting preference

    try {
      console.log('processPayment: Starting preference creation for redirect...');
      
      // Determine amount based on purchase option
      const currentAmount = purchaseOption.value === 'code' ? 0 : 65000;
      const payerName = purchaseData.name || 'Usuario TUIKIGAI';
      const description = purchaseOption.value === 'gift' ? 'Regalo Ikigai Personalizado' : 'Ikigai Personalizado';
      
      // Preparar datos para Firestore - Para compra personal, no enviar campos de gift
      const purchaseDataToSave = {
        userName: payerName,
        email: purchaseData.email,
        lastName: purchaseData.lastName || '',
        idType: purchaseData.idType || '',
        idNumber: purchaseData.idNumber || '',
        telephone: purchaseData.telephone || '',
        city: purchaseData.city || '',
        houseAddress: purchaseData.houseAddress || '',
        typePerson: purchaseData.typePerson || 'natural',
        purchaseType: (purchaseOption.value === 'gift' ? 'gift' : 'personal') as 'gift' | 'personal',
      };
      
      // Solo incluir campos de regalo si es un regalo
      if (purchaseOption.value === 'gift') {
        // @ts-ignore - Añadir campos adicionales de manera segura
        purchaseDataToSave.giftEmail = purchaseData.giftEmail;
        // @ts-ignore
        purchaseDataToSave.giftMessage = purchaseData.giftMessage;
      }
      
      // Guardar en Firestore (purchaseOption.value !== 'code' siempre es true aquí, así que lo eliminamos)
      try {
        const saveResult = await firestoreService.savePurchase(purchaseDataToSave);
        console.log('Datos de compra guardados en Firestore con ID:', saveResult.id);
        
        // Almacenar ID de documento para referencia futura si es necesario
        const purchaseFirestoreId = saveResult.id;
        
        // Continuar con la creación de preferencia de Mercado Pago solo si se guardó correctamente
        if (!saveResult.success) {
          throw new Error('No se pudieron guardar los datos de compra en Firestore');
        }
        
        const backUrls = {
           success: `${location.origin}/payment/success?purchase_id=${purchaseFirestoreId}`,
           failure: `${location.origin}/payment/failure?purchase_id=${purchaseFirestoreId}`,
           pending: `${location.origin}/payment/pending?purchase_id=${purchaseFirestoreId}`
        };
        
        // Gather ALL data needed for the backend (MP Preference + Purchase Sheet)
        const combinedRequestData = {
          // --- Mercado Pago Specific --- 
          items: [{
            id: 'TUIKIGAI-EXP-01',
            title: 'TUIKIGAI - ' + description,
            description: 'Descubre tu propósito con TUIKIGAI',
            quantity: 1,
            unit_price: currentAmount,
            currency_id: 'COP'
          }],
          payer: {
            email: purchaseData.email, // Assuming purchaseData holds user email
            name: payerName
          },
          back_urls: backUrls,
          // We don't set external_reference here; the backend will generate it
          // auto_return: 'approved', // Backend sets default if needed

          // --- PurchaseData Specific (for Google Sheet) ---
          // Ensure these values are available in the component's state/stores
          userName: purchaseData.name || 'Usuario TUIKIGAI', // Use the same name as payer
          email: purchaseData.email, // Redundant but matches PurchaseData type
          love: state.ikigaiResponses.love, // Get from state
          talent: state.ikigaiResponses.talent, // Get from state
          need: state.ikigaiResponses.need, // Get from state
          payment: String(currentAmount), // Send amount as string or number based on backend type
          purchaseType: purchaseOption.value === 'gift' ? 'Gift' : 'Individual', // Determine type
          giftEmail: purchaseOption.value === 'gift' ? purchaseData.giftEmail : '', // Get from purchaseData if gift
          giftMessage: purchaseOption.value === 'gift' ? purchaseData.giftMessage : '', // Get from purchaseData if gift
          
          // timestamp and orderNumber are handled by the backend
        };

        console.log('Frontend: Combined Request payload:', JSON.stringify(combinedRequestData, null, 2));
        console.log('Solicitando preferencia y guardado inicial al backend...');

        // Call the service function with the combined data
        const preference = await mercadoPagoService.createPreference(combinedRequestData);

        if (!preference || !preference.id || !preference.init_point) {
          console.error('No se pudo obtener la preferencia del backend o la respuesta es inválida.');
          const lastError = mercadoPagoService.getLastError();
          paymentError.value = `Error al iniciar el pago: ${lastError?.message || 'No se pudo comunicar con el servidor. Intenta de nuevo.'}`;
          paymentStep.value = 'details'; // Go back to details on error
          isProcessingPayment.value = false;
          return;
        }

        console.log(`Preferencia ${preference.id} creada. Redirecting to: ${preference.init_point}`);
        
        // <<< REDIRECT TO MERCADO PAGO >>>
        window.location.href = preference.init_point;
        // The user will leave the page here. The spinner will stay visible briefly.
        // No need to set isProcessingPayment back to false here.

      } catch (firestoreError) {
        console.error('Error guardando datos en Firestore:', firestoreError);
        paymentError.value = 'Hubo un problema guardando tus datos. Por favor intenta de nuevo.';
        paymentStep.value = 'details';
        isProcessingPayment.value = false;
        return; // No continuar con Mercado Pago si falla Firestore
      }
    } catch (error) {
      console.error('Error general en processPayment:', error);
      paymentError.value = error instanceof Error
        ? `Error inesperado: ${error.message}`
        : 'Error desconocido al procesar el pago.';
      paymentStep.value = 'details';
      isProcessingPayment.value = false;
    }
  });

  // Función para validar código promocional
  const validatePromoCode = $(async () => {
    // Verificar que haya un código y un email
    if (!purchaseData.promoCode || !purchaseData.email || !purchaseData.name) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Verificar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(purchaseData.email)) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }

    // Verificar que los campos obligatorios adicionales estén completos
    if (!purchaseData.city || !purchaseData.houseAddress) {
      alert('Por favor, completa los campos de Ciudad y Domicilio');
      return;
    }

    // Iniciar proceso de validación
    isProcessingPayment.value = true;
    paymentStep.value = 'confirmation';

    try {
      // Guardar en Firestore
      const saveResult = await firestoreService.savePromoCode({
        name: purchaseData.name,
        email: purchaseData.email,
        promoCode: purchaseData.promoCode,
        city: purchaseData.city,
        houseAddress: purchaseData.houseAddress,
        company: purchaseData.company || undefined
      });
      
      if (!saveResult.success) {
        throw new Error('No se pudo guardar el código promocional');
      }
      
      console.log('Código promocional guardado en Firestore con ID:', saveResult.id);
      
      // Preparar datos para la API original
      const promoData = {
        name: purchaseData.name,
        email: purchaseData.email,
        promoCode: purchaseData.promoCode,
        city: purchaseData.city,
        houseAddress: purchaseData.houseAddress,
        company: purchaseData.company || '',
        ikigaiData: {
          userName: state.userName,
          love: state.ikigaiResponses.love,
          talent: state.ikigaiResponses.talent,
          need: state.ikigaiResponses.need,
          payment: state.ikigaiResponses.payment
        },
        timestamp: new Date().toISOString()
      };

      // Mantener llamada a API original
      try {
        const response = await fetch('/api/save-promo-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promoData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn('La API original devolvió un error pero ya guardamos en Firestore:', errorData.error);
          // No lanzamos error aquí, continuamos porque ya guardamos en Firestore
        }
      } catch (apiError) {
        console.warn('Error llamando a la API original, pero los datos ya están en Firestore:', apiError);
        // No lanzamos error aquí, continuamos porque ya guardamos en Firestore
      }

      // Generar número de orden para referencia
      purchaseData.orderNumber = `TI-PROMO-${Math.floor(Math.random() * 100000)}`;

      // Esperar un momento para simular el procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Proceso exitoso
      console.log('Código promocional validado correctamente');
      paymentStep.value = 'success';
      isProcessingPayment.value = false;
      
      // Opcionalmente, mostrar mensaje de éxito
      alert('Hemos recibido tú código, TUIKIGAI estará listo.');

    } catch (error) {
      console.error('Error al validar código promocional:', error);

      // Mostrar mensaje de error
      paymentError.value = error instanceof Error
        ? error.message
        : 'Ocurrió un error al validar el código. Por favor, intenta nuevamente.';

      // Volver al paso de detalles
      paymentStep.value = 'details';
      isProcessingPayment.value = false;
    }
  });

  // Función para reiniciar el proceso de compra
  const resetPurchase = $(() => {
    showPurchaseModal.value = false;
    showPaymentModal.value = false;
    purchaseOption.value = null;
    paymentStep.value = 'details';
    isProcessingPayment.value = false;
    paymentError.value = '';

    // Limpiar datos de compra
    purchaseData.email = '';
    purchaseData.name = ''; // Asegurarse de limpiar nombre también
    purchaseData.giftEmail = '';
    purchaseData.giftMessage = '';
    purchaseData.promoCode = '';
    purchaseData.orderNumber = '';
    purchaseData.city = '';
    purchaseData.houseAddress = '';
    purchaseData.company = '';
  });

  // Mensaje motivacional basado en el progreso
  const getMotivationalMessage = () => {
    const progress = state.progress;
    if (progress < 30) {
      return slogan;
    } else if (progress < 60) {
      return motivationalMessages.talent[currentMotivationalIndex.talent];
    } else if (progress < 90) {
      return motivationalMessages.need[currentMotivationalIndex.need];
    } else {
      return motivationalMessages.payment[currentMotivationalIndex.payment];
    }
  };

  // Función para mostrar el contenido principal según la pestaña seleccionada
  const renderMainContent = () => {
    // Si las respuestas tienen contenido y alguna vez se expandió el panel de alguna tarjeta, 
    // mostramos la opción de ver el ikigai dinámico
    if (Object.values(state.ikigaiResponses).some(response => response.trim().length > 0) && 
        expandedCard.value !== null) {
      showRealTimeOption.value = true;
    }

    // Template de colores para el ikigai
    const ikigaiTemplates = [
      { id: 'gris', name: 'Gris', color: 'bg-gray-400', path: getAssetPath('images/IKIGAI_Gris.png') },
      { id: 'naranja', name: 'Naranja', color: 'bg-orange-500', path: getAssetPath('images/IKIGAI_Naranja.png') },
      { id: 'rojo', name: 'Rojo', color: 'bg-red-600', path: getAssetPath('images/IKIGAI_Rojo.png') },
      { id: 'verde', name: 'Verde', color: 'bg-green-600', path: getAssetPath('images/IKIGAI_Verde.png') },
      { id: 'azul', name: 'Azul', color: 'bg-blue-600', path: getAssetPath('images/IKIGAI_Azul.png') },
      { id: 'morado', name: 'Morado', color: 'bg-purple-600', path: getAssetPath('images/IKIGAI_Morado.png') },
      { id: 'amarillo', name: 'Amarillo', color: 'bg-yellow-500', path: getAssetPath('images/IKIGAI_Amarillo.png') }
    ];

    return (
      <div class="w-full flex flex-col items-center space-y-8">
        <div class="w-full">
          <h3 class="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-4">
            {showStaticIkigai.value ? 'Elige el color de tu IKIGAI' : 'Tu IKIGAI en Tiempo Real'}
          </h3>
          
          {/* Botones para alternar entre vistas */}
          <div class="flex justify-center gap-4 mb-6">
            <button 
              onClick$={() => showStaticIkigai.value = true}
              class={`px-5 py-2 rounded-lg font-medium transition-all ${showStaticIkigai.value 
                ? 'bg-green-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Imágenes Prediseñadas
            </button>
            
            {showRealTimeOption.value && (
              <button 
                onClick$={() => showStaticIkigai.value = false}
                class={`px-5 py-2 rounded-lg font-medium transition-all ${!showStaticIkigai.value 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Ikigai en Tiempo Real
              </button>
            )}
          </div>
          
          {showStaticIkigai.value ? (
            <>
              {/* Selector de colores */}
              <div class="flex flex-wrap gap-3 justify-center mb-8">
                {ikigaiTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick$={() => selectedIkigaiImage.value = template.path}
                    class={`w-9 h-9 rounded-full ${template.color} transition-all border-2 ${
                      selectedIkigaiImage.value === template.path
                        ? 'border-black scale-110 shadow-lg'
                        : 'border-transparent hover:scale-105'
                    }`}
                    aria-label={`Seleccionar color ${template.name}`}
                  />
                ))}
              </div>
              
              {/* Imagen estática del ikigai */}
              <div class="max-w-[500px] mx-auto">
                <img
                  src={selectedIkigaiImage.value}
                  class="w-full h-auto"
                  alt="Diagrama de Ikigai"
                />
              </div>
            </>
          ) : (
            /* Ikigai dinámico con D3.js */
            <div class="max-w-[500px] h-[500px] mx-auto">
              <IkigaiDiagram 
                responses={state.ikigaiResponses} 
                convergenceIndex={state.convergenceIndex} 
                ref={svgRef}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Definición de plantillas de ikigai
  const ikigaiTemplates = [
    { id: 'gris', name: 'Gris', color: 'bg-gray-400', path: getAssetPath('images/IKIGAI_Gris.png') },
    { id: 'naranja', name: 'Naranja', color: 'bg-orange-500', path: getAssetPath('images/IKIGAI_Naranja.png') },
    { id: 'rojo', name: 'Rojo', color: 'bg-red-600', path: getAssetPath('images/IKIGAI_Rojo.png') },
    { id: 'verde', name: 'Verde', color: 'bg-green-600', path: getAssetPath('images/IKIGAI_Verde.png') },
    { id: 'azul', name: 'Azul', color: 'bg-blue-600', path: getAssetPath('images/IKIGAI_Azul.png') },
    { id: 'morado', name: 'Morado', color: 'bg-purple-600', path: getAssetPath('images/IKIGAI_Morado.png') },
    { id: 'amarillo', name: 'Amarillo', color: 'bg-yellow-500', path: getAssetPath('images/IKIGAI_Amarillo.png') }
  ];

  // Función para manejar la selección de color
  const handleColorSelection = $((templatePath: string) => {
    selectedIkigaiImage.value = templatePath;
  });

  return (
    <div class="wrapper min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col">
      {/* Banner superior con el slogan */}
      <div class="w-full bg-green-700 text-white py-2 text-center text-sm md:text-base">
        {slogan}
      </div>

      <div class="flex-1 container mx-auto px-4 py-10 md:py-16">
        <div class="text-center mb-8">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            <span class="text-blue-600">TU</span>
            <span class="relative inline-block mx-1">
              <span class="relative z-10">IKIGAI</span>
              <span class="absolute bottom-1 left-0 w-full h-3 bg-teal-200/50 -rotate-1 rounded z-0"></span>
            </span>
          </h1>
          <p class="max-w-2xl mx-auto text-slate-600 text-lg">
            Responde las preguntas y descubre tu propósito de vida con nuestra herramienta única
          </p>
        </div>

        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-8">
            {/* Columna izquierda para las preguntas */}
            <div>
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 mb-6">
                {/* ... existing code for name input ... */}
              </div>

              {/* Ikigai cards */}
              {/* ... existing code for ikigai cards ... */}

              {/* Terms and conditions */}
              {/* ... existing code for terms ... */}

              {/* Submit button */}
              {/* ... existing code for submit button ... */}
            </div>

            {/* Columna derecha para el diagrama Ikigai */}
            <div class="xl:sticky xl:top-8">
              <div class="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300 overflow-hidden">
                
                {/* Check if responses have content and show the real-time option */}
                {Object.values(state.ikigaiResponses).some(response => response.trim().length > 0) && (
                  <div class="flex justify-center gap-4 p-4 border-b border-slate-200">
                    <button 
                      onClick$={() => showStaticIkigai.value = true}
                      class={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showStaticIkigai.value 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Imágenes Prediseñadas
                    </button>
                    
                    <button 
                      onClick$={() => showStaticIkigai.value = false}
                      class={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!showStaticIkigai.value 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      Ikigai en Tiempo Real
                    </button>
                  </div>
                )}
                
                <div class="aspect-square w-full">
                  {!showStaticIkigai.value ? (
                    <IkigaiDiagram
                      responses={state.ikigaiResponses}
                      convergenceIndex={state.convergenceIndex}
                      ref={svgRef}
                    />
                  ) : (
                    <div class="w-full h-full relative">
                      {/* Display selected static ikigai image */}
                      {selectedIkigaiImage.value ? (
                        <img 
                          src={selectedIkigaiImage.value} 
                          alt="IKIGAI Plantilla" 
                          class="w-full h-full object-contain"
                        />
                      ) : (
                        <div class="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                          Selecciona un color
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Color selector buttons for static ikigai - Siempre visible */}
                <div class="p-4 border-t border-slate-200">
                  <p class="text-xs text-slate-500 mb-3 text-center">Selecciona un color</p>
                  <div class="flex justify-center space-x-3">
                    {ikigaiTemplates.map((template) => (
                      <button 
                        key={template.id}
                        onClick$={() => handleColorSelection(template.path)}
                        class={`w-8 h-8 rounded-full ${template.color} ${selectedIkigaiImage.value === template.path ? 'ring-2 ring-offset-2 ring-slate-500' : 'hover:opacity-80'} transition-all`}
                        aria-label={`IKIGAI ${template.name}`}
                        title={`IKIGAI ${template.name}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and other UI components */}
      {/* ... existing code for modals ... */}
    </div>
  );
});