import { component$, useSignal, useStore, $, useVisibleTask$, type Signal } from '@builder.io/qwik';
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

// Helper component for the static Ikigai image view
const StaticIkigaiView = component$(({ imageSrc }: { imageSrc: string | null }) => {
  return (
    <img
      key="static-ikigai-view"
      src={imageSrc || getAssetPath('images/IKIGAI_Verde.png')}
      alt="IKIGAI Plantilla"
      class="w-full h-full object-contain"
    />
  );
});

// Helper component for the dynamic Ikigai diagram view
interface DynamicIkigaiViewProps {
  responses: UnifiedIkigaiState['ikigaiResponses'];
  convergenceIndex: number;
  userName: string;
  svgRef: Signal<SVGSVGElement | undefined>;
}
const DynamicIkigaiView = component$<DynamicIkigaiViewProps>(({ responses, convergenceIndex, userName, svgRef }) => {
  return (
    <div key="dynamic-ikigai-view" class="w-full h-full p-4">
      <IkigaiDiagram
        responses={responses}
        convergenceIndex={convergenceIndex}
        userName={userName}
        ref={svgRef}
      />
    </div>
  );
});

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
  const selectedIkigaiImage = useSignal<string | null>(getAssetPath('images/IKIGAI_Verde.png'));
  const showStaticIkigai = useSignal(true);

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

  // Función para obtener el color seleccionado en español - definida con $ para reactivity
  const getSelectedColorName = $(() => {
    // Encuentra el template cuyo path coincide con la imagen seleccionada
    const selectedTemplate = ikigaiTemplates.find(
      template => template.path === selectedIkigaiImage.value
    );
    // Retorna el nombre en español o un valor por defecto
    return selectedTemplate ? selectedTemplate.name : 'Verde';
  });

  // Función para manejar la selección de color
  const handleColorSelection = $((templatePath: string) => {
    selectedIkigaiImage.value = templatePath;
  });

  return (
    <section class="min-h-screen w-full flex flex-col items-center justify-start relative overflow-hidden bg-black">
      {/* Efectos de fondo premium mejorados */}
      <div class="absolute inset-0 overflow-hidden">
        {/* Fondo ZEN con gradiente suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-gray-50 to-white"></div>

        {/* Elementos zen minimalistas */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-repeat opacity-20"></div>
        </div>

        {/* Círculos zen suaves */}
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-gradient-radial from-teal-200/20 to-transparent blur-[60px] opacity-40"></div>
        <div className="absolute bottom-[5%] right-[5%] w-[30%] h-[30%] rounded-full bg-gradient-radial from-blue-200/20 to-transparent blur-[60px] opacity-30"></div>
        <div className="absolute top-[40%] right-[10%] w-[25%] h-[25%] rounded-full bg-gradient-radial from-slate-200/20 to-transparent blur-[50px] opacity-30"></div>

        {/* Líneas horizontales zen */}
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 to-transparent"></div>
        <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/20 to-transparent"></div>
      </div>

      {/* Contenido principal - Con estilos actualizados para combinar con el fondo zen */}
      <div class="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Encabezado y barra de progreso */}
        <div class="text-center mb-12">
          <img
            src={getAssetPath('images/TuIkigai Logo_Recorte.png')}
            alt="TUIKIGAI Logo"
            class="w-24 h-24 object-contain mx-auto mb-6 animate-float filter drop-shadow-md"
          />
          <h1 class="text-4xl md:text-5xl font-bold text-slate-800 mb-6 tracking-tight">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-slate-700 via-teal-600 to-slate-700">
              Descubre tu IKIGAI
            </span>
          </h1>

          {/* Barra de progreso zen mejorada */}
          <div class="max-w-2xl mx-auto mb-16 px-4">
            {/* Barra de progreso principal */}
            <div class="mb-12 relative h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div
                class="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-400 to-blue-400 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${state.progress}%` }}
              ></div>
            </div>
            
            {/* Marcadores de progreso con mejor separación */}
            <div class="flex justify-between relative">
              {['Inicio', 'Pasión', 'Talento', 'Propósito', 'Completado'].map((label, index) => (
                <div key={index} class="flex flex-col items-center relative" style={{ width: '60px' }}>
                  <div class={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    state.currentStep >= index
                      ? 'bg-gradient-to-r from-teal-400 to-blue-400 shadow-md'
                      : 'bg-white border border-slate-200'
                  }`}>
                    {state.currentStep > index && (
                      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    )}
                  </div>
                  <span class={`text-xs font-medium mt-3 transition-colors duration-300 text-center w-16 ${
                    state.currentStep >= index ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mensaje motivacional basado en el progreso */}
        <div class="text-center mb-8 mt-4 relative">
          <div class="flex items-center justify-center space-x-3">
            {/* Tooltip izquierdo - ¿Qué es el Ikigai? */}
            <div class="relative">
              <button 
                onClick$={() => toggleTooltip('ikigai')}
                class="px-3 py-1.5 rounded-full bg-white shadow-md text-teal-600 border border-teal-300 flex items-center hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 text-xs font-medium"
                aria-label="¿Qué es el Ikigai?"
                title="¿Qué es el Ikigai?"
              >
                ¿Qué es el Ikigai?
              </button>
              
              {/* Contenido del tooltip */}
              {showTooltipIkigai.value && (
                <div class="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-lg shadow-lg p-4 border border-slate-200 transform transition-opacity animate-fade-in z-20">
                  <div class="absolute bottom-0 left-3 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-slate-200"></div>
                  <h4 class="font-medium text-sm text-slate-800 mb-1">¿Qué es el Ikigai?</h4>
                  <p class="text-xs text-slate-600 text-justify">Es la razón de ser en la vida, tu propósito por el cual te levantas todos los días y le das significado a tus acciones.</p>
                </div>
              )}
            </div>
            
            <p class="text-slate-600 text-sm md:text-base font-medium leading-relaxed transition-all duration-500 relative z-10 px-2 max-w-xl">
              {slogan}
            </p>
            
            {/* Tooltip derecho - ¿Qué hacemos en tu Ikigai? */}
            <div class="relative">
              <button 
                onClick$={() => toggleTooltip('tuikigai')}
                class="px-3 py-1.5 rounded-full bg-white shadow-md text-blue-600 border border-blue-300 flex items-center hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 text-xs font-medium"
                aria-label="¿Qué hacemos en tu Ikigai?"
                title="¿Qué hacemos en tu Ikigai?"
              >
                ¿Qué hacemos en tu Ikigai?
              </button>
              
              {/* Contenido del tooltip */}
              {showTooltipTuIkigai.value && (
                <div class="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-lg shadow-lg p-4 border border-slate-200 transform transition-opacity animate-fade-in z-20">
                  <div class="absolute bottom-0 right-3 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-slate-200"></div>
                  <h4 class="font-medium text-sm text-slate-800 mb-1">¿Qué hacemos en tu Ikigai?</h4>
                  <p class="text-xs text-slate-600 text-justify">Todos te dicen que debes tener un propósito pero no te dicen cómo construirlo. En TuIkigai te ayudamos a resolverlo, encontrando la conexión vital entre lo que amas, en lo que eres bueno, lo que el mundo necesita y tu sustento económico.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid principal con layout adaptable - estilo zen */}
        <div class="container mx-auto px-4 py-12">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div class="space-y-6">
              {/* Campo de nombre con diseño minimalista zen */}
              <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300">
                <label class="block text-slate-700 text-sm font-medium mb-2">Tu nombre</label>
                <input
                  type="text"
                  class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-transparent transition-all duration-200"
                  placeholder="¿Cómo te llamas?"
                  value={state.userName}
                  onInput$={(e: any) => state.userName = e.target.value}
                />
              </div>

              {/* Tarjetas mejoradas con estilo zen */}
              <div class="space-y-6">
                {['love', 'talent', 'need', 'payment'].map((type, index) => (
                  <div key={type} class="relative">
                    {/* Línea conectora vertical más sutil */}
                    {index > 0 && (
                      <div class={`absolute left-8 top-[-24px] h-6 w-0.5 ${
                        state.ikigaiResponses[type as keyof typeof state.ikigaiResponses].length > 0 ||
                        state.ikigaiResponses[
                          ['love', 'talent', 'need', 'payment'][index-1] as keyof typeof state.ikigaiResponses
                        ].length > 0
                          ? 'bg-gradient-to-b from-teal-400 to-blue-400'
                          : 'bg-slate-200'
                      } transition-colors duration-500`}></div>
                    )}

                    {/* Tarjeta Ikigai */}
                    <IkigaiCard
                      id={type}
                      title={
                        type === 'love' ? "Lo que amas" :
                        type === 'talent' ? "En lo que eres bueno" :
                        type === 'need' ? "Lo que el mundo necesita" :
                        "Por lo que te pagarían"
                      }
                      color={type === 'love' ? 'ikigai-love' :
                             type === 'talent' ? 'ikigai-talent' :
                             type === 'need' ? 'ikigai-need' :
                             'ikigai-payment'}
                      expanded={expandedCard.value === type}
                      value={state.ikigaiResponses[type as keyof typeof state.ikigaiResponses]}
                      characterCount={characterCounts[type as keyof typeof characterCounts]}
                      motivationalMessage={motivationalMessages[type as keyof typeof motivationalMessages][currentMotivationalIndex[type as keyof typeof currentMotivationalIndex]]}
                      onToggle$={(id: string) => {
                        expandedCard.value = expandedCard.value === id ? null : id;
                        // Rotamos el mensaje motivacional cuando se expande
                        if (expandedCard.value === id) {
                          rotateMotivationalMessage(id);
                        }
                      }}
                      onChange$={(value: string) => handleInputChange(type, value)}
                      iconType={
                        type === 'love' ? "heart" :
                        type === 'talent' ? "star" :
                        type === 'need' ? "globe" :
                        "money"
                      }
                      step={index + 1}
                      completed={state.ikigaiResponses[type as keyof typeof state.ikigaiResponses].length > 0}
                      pulseAnimation={expandedCard.value === type}
                    />
                  </div>
                ))}
              </div>

              {/* Términos y condiciones con diseño minimalista */}
              <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300">
                <div class="space-y-4">
                  <div class="flex items-start">
                    <div class="flex h-5 items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        class="h-4 w-4 rounded border-slate-300 bg-white/80 text-teal-500 focus:ring-teal-400/30"
                        checked={state.acceptTerms}
                        onChange$={() => state.acceptTerms = !state.acceptTerms}
                      />
                    </div>
                    <label for="terms" class="ml-3 text-sm text-slate-600">
                      Acepto los <a href="/terminos/" target="_blank" rel="noopener noreferrer" class="text-teal-600 hover:text-teal-500 transition-colors duration-200 underline">términos y condiciones</a>
                    </label>
                  </div>

                  <div class="flex items-start">
                    <div class="flex h-5 items-center">
                      <input
                        type="checkbox"
                        id="privacy"
                        class="h-4 w-4 rounded border-slate-300 bg-white/80 text-teal-500 focus:ring-teal-400/30"
                        checked={state.acceptPrivacy}
                        onChange$={() => state.acceptPrivacy = !state.acceptPrivacy}
                      />
                    </div>
                    <label for="privacy" class="ml-3 text-sm text-slate-600">
                      Acepto la <a href="/privacidad/" target="_blank" rel="noopener noreferrer" class="text-teal-600 hover:text-teal-500 transition-colors duration-200 underline">política de tratamiento de datos</a>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botón de continuar zen mejorado */}
              <button
                onClick$={handleSubmit}
                class={`w-full group relative overflow-hidden px-8 py-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition-all duration-500 ${
                  state.progress < 70
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-400 to-blue-400 text-white transform hover:translate-y-[-2px]'
                }`}
                disabled={state.progress < 70 || isSubmitting.value}
              >
                <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-500 to-blue-500 opacity-0 group-hover:opacity-80 transition-opacity duration-500"></span>
                <span class="relative flex items-center justify-center gap-2">
                  {isSubmitting.value ? (
                    <>
                      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11H10z" />
                      </svg>
                      {state.progress < 70 ? 'Completa tu Ikigai para continuar' : 'Descubre tu Ikigai'}
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Columna derecha para el diagrama Ikigai */}
            <div class="xl:sticky xl:top-8">
              <div class="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm transition-all duration-300 hover:border-slate-300 overflow-hidden">
                <div class="aspect-square w-full">
                  <div class="w-full h-full relative">
                    {showStaticIkigai.value ? (
                      <StaticIkigaiView imageSrc={selectedIkigaiImage.value} />
                    ) : (
                      <DynamicIkigaiView
                        responses={state.ikigaiResponses}
                        convergenceIndex={state.convergenceIndex}
                        userName={state.userName}
                        svgRef={svgRef}
                      />
                    )}
                  </div>
                </div>
                <div class="p-4 border-t border-slate-200">
                  <div class="flex justify-between items-center mb-3">
                    <p class="text-xs text-slate-500">
                      {showStaticIkigai.value ? "Selecciona un color" : "Ikigai en Tiempo Real"}
                    </p>
                    <button 
                      onClick$={() => showStaticIkigai.value = !showStaticIkigai.value}
                      class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-md transition-all flex items-center"
                    >
                      {showStaticIkigai.value ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Ver en Tiempo Real
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                          Ver Colores
                        </>
                      )}
                    </button>
                  </div>
                  
                  {showStaticIkigai.value && (
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de compra premium con efectos zen */}
      {showPurchaseModal.value && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-md"></div>
          <div class="relative bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8 max-w-lg w-full border border-slate-200 overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Efectos sutiles */}
            <div class="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-teal-100/30 blur-xl"></div>
            <div class="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-100/30 blur-xl"></div>

            {/* Logo en posición absoluta */}
            <div class="absolute -top-10 -right-10 opacity-5">
              {/* Use getAssetPath con la ruta de imagen correcta */}
              <img src={getAssetPath('images/TuIkigai Logo_Recorte.png')} alt="Logo" class="w-40 h-40" />
            </div>

            <h2 class="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">¿Cómo deseas continuar?</h2>
            <p class="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">Selecciona una opción para proceder con tu Ikigai</p>

            <div class="space-y-3 sm:space-y-4">
              <button
                class={`w-full relative overflow-hidden p-3 sm:p-4 bg-white hover:bg-slate-50 border ${purchaseOption.value === 'personal' ? 'border-teal-400' : 'border-slate-200'} text-slate-800 rounded-lg flex items-center justify-between transition-all duration-300 hover:translate-y-[-2px] group`}
                onClick$={() => handlePurchaseOption('personal')}
              >
                <span class="flex items-center">
                  <span class={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full ${purchaseOption.value === 'personal' ? 'bg-teal-400' : 'bg-teal-100'} mr-2 sm:mr-3`}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <div class="flex flex-col text-left">
                    <span class="font-medium text-sm sm:text-base">Comprar para mí</span>
                    <span class="text-xs sm:text-sm text-slate-500">Descarga tu Ikigai personal</span>
                  </div>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                class={`w-full relative overflow-hidden p-3 sm:p-4 bg-white hover:bg-slate-50 border ${purchaseOption.value === 'gift' ? 'border-blue-400' : 'border-slate-200'} text-slate-800 rounded-lg flex items-center justify-between transition-all duration-300 hover:translate-y-[-2px] group`}
                onClick$={() => handlePurchaseOption('gift')}
              >
                <span class="flex items-center">
                  <span class={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full ${purchaseOption.value === 'gift' ? 'bg-blue-400' : 'bg-blue-100'} mr-2 sm:mr-3`}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14a2 2 0 110 4H5a2 2 0 110-4z" />
                    </svg>
                  </span>
                  <div class="flex flex-col text-left">
                    <span class="font-medium text-sm sm:text-base">Regalar a alguien</span>
                    <span class="text-xs sm:text-sm text-slate-500">Envía como regalo a un ser querido</span>
                  </div>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                class={`w-full relative overflow-hidden p-3 sm:p-4 bg-white hover:bg-slate-50 border ${purchaseOption.value === 'code' ? 'border-slate-500' : 'border-slate-200'} text-slate-800 rounded-lg flex items-center justify-between transition-all duration-300 hover:translate-y-[-2px] group`}
                onClick$={() => handlePurchaseOption('code')}
              >
                <span class="flex items-center">
                  <span class={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full ${purchaseOption.value === 'code' ? 'bg-slate-500' : 'bg-slate-200'} mr-2 sm:mr-3`}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </span>
                  <div class="flex flex-col text-left">
                    <span class="font-medium text-sm sm:text-base">Tengo un código</span>
                    <span class="text-xs sm:text-sm text-slate-500">Canjea tu código promocional</span>
                  </div>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Campo de código promocional con estilo zen */}
            {purchaseOption.value === 'code' && (
              <div class="mt-4 sm:mt-6 animate-fade-in">
                <div class="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 space-y-3 sm:space-y-4">
                  <h4 class="font-medium text-sm sm:text-base text-slate-700 mb-1 sm:mb-2">Completa tus datos</h4>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Tu Nombre <span class="text-red-500">*</span></label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                      placeholder="Escribe tu nombre completo"
                      value={purchaseData.name}
                      onInput$={(e: any) => purchaseData.name = e.target.value}
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Tu Correo Electrónico <span class="text-red-500">*</span></label>
                    <input
                      type="email"
                      class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                      placeholder="tu@email.com"
                      value={purchaseData.email}
                      onInput$={(e: any) => purchaseData.email = e.target.value}
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Ciudad <span class="text-red-500">*</span></label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                      placeholder="Tu ciudad"
                      value={purchaseData.city}
                      onInput$={(e: any) => purchaseData.city = e.target.value}
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Domicilio <span class="text-red-500">*</span></label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                      placeholder="Tu dirección completa"
                      value={purchaseData.houseAddress}
                      onInput$={(e: any) => purchaseData.houseAddress = e.target.value}
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                      placeholder="Nombre de tu empresa (opcional)"
                      value={purchaseData.company}
                      onInput$={(e: any) => purchaseData.company = e.target.value}
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Código promocional <span class="text-red-500">*</span></label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                      placeholder="Ej: IKIGAI2023"
                      value={purchaseData.promoCode}
                      onInput$={(e: any) => purchaseData.promoCode = e.target.value}
                    />
                  </div>

                  <div class="text-xs text-slate-500">
                    El código debe ser válido y no haber expirado.
                  </div>

                  <button
                    class="w-full py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] text-sm sm:text-base"
                    onClick$={validatePromoCode}
                    disabled={!purchaseData.promoCode || !purchaseData.name || !purchaseData.email || !purchaseData.city || !purchaseData.houseAddress || isProcessingPayment.value}
                  >
                    {isProcessingPayment.value ? 'Validando...' : 'Validar código'}
                  </button>
                </div>
              </div>
            )}

            <button
              class="absolute top-2 right-2 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors duration-200 focus:outline-none"
              onClick$={resetPurchase}
              aria-label="Cerrar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal de pago (MODIFICADO) */}
      {showPaymentModal.value && (
        <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-md"></div>
          <div class="relative bg-white rounded-2xl shadow-md p-4 sm:p-6 md:p-8 max-w-lg w-full border border-slate-200 overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Efectos sutiles */}
            <div class="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-teal-100/30 blur-xl"></div>
            <div class="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-100/30 blur-xl"></div>

            {/* --- PASO DETALLES --- */}
            {paymentStep.value === 'details' && (
              <div class="space-y-4 sm:space-y-6">
                <h2 class="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">Información de pago</h2>
                <p class="text-sm sm:text-base text-slate-600 mb-2 sm:mb-4">Completa tus datos para finalizar la compra</p>

                <div class="space-y-3 sm:space-y-4">
                  {/* Información personal */}
                  <div class="bg-white rounded-xl p-3 sm:p-4 border border-slate-200">
                    <h3 class="text-base sm:text-lg font-medium text-slate-700 mb-2 sm:mb-3">Información personal</h3>

                    <div class="space-y-2 sm:space-y-3">
                      {/* Nombre y Apellido */}
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                          <input
                            type="text"
                            class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                            placeholder={state.userName || "Tu nombre"}
                            value={purchaseData.name}
                            onInput$={(e: any) => purchaseData.name = e.target.value}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Apellido <span class="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                            placeholder="Tu apellido"
                            value={purchaseData.lastName}
                            onInput$={(e: any) => purchaseData.lastName = e.target.value}
                          />
                        </div>
                      </div>
                      
                      {/* Email (requerido) */}
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Email <span class="text-red-500">*</span></label>
                        <input
                          type="email"
                          required
                          class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                          placeholder="tu@email.com"
                          value={purchaseData.email}
                          onInput$={(e: any) => purchaseData.email = e.target.value}
                        />
                      </div>
                      
                      {/* Documento de identidad */}
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Tipo de documento <span class="text-red-500">*</span></label>
                          <select
                            required
                            class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                            value={purchaseData.idType}
                            onChange$={(e: any) => purchaseData.idType = e.target.value}
                          >
                            <option value="" disabled selected>Selecciona...</option>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="NIT">NIT</option>
                            <option value="PASSPORT">Pasaporte</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Número de documento <span class="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                            placeholder="Número de documento"
                            value={purchaseData.idNumber}
                            onInput$={(e: any) => purchaseData.idNumber = e.target.value}
                          />
                        </div>
                      </div>
                      
                      {/* Teléfono y Ciudad */}
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Teléfono <span class="text-red-500">*</span></label>
                          <input
                            type="tel"
                            required
                            class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                            placeholder="Tu número de teléfono"
                            value={purchaseData.telephone}
                            onInput$={(e: any) => purchaseData.telephone = e.target.value}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-1">Ciudad <span class="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                            placeholder="Tu ciudad"
                            value={purchaseData.city}
                            onInput$={(e: any) => purchaseData.city = e.target.value}
                          />
                        </div>
                      </div>
                      
                      {/* Dirección */}
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Dirección <span class="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200"
                          placeholder="Tu dirección completa"
                          value={purchaseData.houseAddress}
                          onInput$={(e: any) => purchaseData.houseAddress = e.target.value}
                        />
                      </div>
                      
                      {/* Tipo de persona */}
                      <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Tipo de persona <span class="text-red-500">*</span></label>
                        <div class="flex flex-wrap space-x-4">
                          <label class="inline-flex items-center mb-1">
                            <input
                              type="radio"
                              class="form-radio text-teal-500"
                              name="typePerson"
                              value="natural"
                              checked={purchaseData.typePerson === 'natural'}
                              onChange$={() => purchaseData.typePerson = 'natural'}
                            />
                            <span class="ml-2 text-sm sm:text-base">Persona Natural</span>
                          </label>
                          <label class="inline-flex items-center">
                            <input
                              type="radio"
                              class="form-radio text-teal-500"
                              name="typePerson"
                              value="juridica"
                              checked={purchaseData.typePerson === 'juridica'}
                              onChange$={() => purchaseData.typePerson = 'juridica'}
                            />
                            <span class="ml-2 text-sm sm:text-base">Persona Jurídica</span>
                          </label>
                        </div>
                      </div>

                      {/* Campos para Regalo */}
                      {purchaseOption.value === 'gift' && (
                        <div class="pt-3 sm:pt-4 border-t border-slate-200 mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                          <h3 class="text-base sm:text-lg font-medium text-slate-700">Datos del Destinatario</h3>
                          <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Email del destinatario <span class="text-red-500">*</span></label>
                            <input
                              type="email"
                              required
                              class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-200"
                              placeholder="destinatario@email.com"
                              value={purchaseData.giftEmail}
                              onInput$={(e: any) => purchaseData.giftEmail = e.target.value}
                            />
                          </div>

                          <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Mensaje personal (opcional)</label>
                            <textarea
                              class="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-200 resize-none"
                              placeholder="Escribe un mensaje personal..."
                              rows={3}
                              value={purchaseData.giftMessage}
                              onInput$={(e: any) => purchaseData.giftMessage = e.target.value}
                            ></textarea>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {purchaseOption.value !== 'code' && (
                      <div class="bg-white rounded-xl p-3 sm:p-4 border border-slate-200">
                          <h3 class="text-base sm:text-lg font-medium text-slate-700 mb-2 sm:mb-3">Detalles de pago</h3>
                          <div class="bg-slate-50 p-2 sm:p-3 rounded-lg border border-slate-200 text-sm text-slate-700 mb-3 sm:mb-4">
                              <p>Total a pagar: <span class="font-bold">$65.000 COP</span></p>
                              <p class="mt-1">Serás dirigido a Mercado Pago para completar la transacción de forma segura.</p>
                          </div>
                          {/* Mensaje de error persistente si hubo uno */}
                          {paymentError.value && (
                            <div class="text-red-500 text-sm mt-2 p-2 sm:p-3 bg-red-50 rounded border border-red-100">
                              <p class="font-medium">Error anterior:</p>
                              <p>{paymentError.value}</p>
                            </div>
                          )}
                      </div>
                  )}
                </div>

                {/* Botones de acción */}
                {purchaseOption.value === 'code' ? (
                  <button class="w-full py-3 sm:py-4 mt-3 sm:mt-4 ..." onClick$={validatePromoCode} disabled={!purchaseData.promoCode || !purchaseData.email || isProcessingPayment.value}>
                    {isProcessingPayment.value ? 'Validando...' : 'Validar código'}
                  </button>
                ) : (
                  <button
                    class="w-full py-3 sm:py-4 mt-3 sm:mt-4 bg-gradient-to-r from-teal-400 to-blue-400 text-white rounded-xl transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick$={processPayment}
                    disabled={!purchaseData.email || (purchaseOption.value === 'gift' && !purchaseData.giftEmail) || isProcessingPayment.value}
                  >
                    {isProcessingPayment.value ? (
                      <>
                        <div class="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Continuar al pago ($65.000 COP)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
            
            {/* --- PASO PROCESANDO (Loading state only before redirect) --- */}
            {paymentStep.value === 'processing' && (
              <div class="py-8 text-center">
                <div class="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
                <h3 class="text-lg sm:text-xl font-semibold text-slate-800 mb-2">Preparando tu pago</h3>
                <p class="text-slate-600 text-sm sm:text-base">Serás redirigido a la plataforma de pago en unos instantes...</p>
              </div>
            )}

            {/* --- PASO ÉXITO --- */}
            {paymentStep.value === 'success' && (
              <div class="text-center space-y-4 sm:space-y-6 py-4">
                <div class="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 sm:h-12 sm:w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 class="text-xl sm:text-2xl font-bold text-slate-800">¡Pago completado!</h2>

                <p class="text-sm sm:text-base text-slate-600">
                  Tu pedido ha sido procesado correctamente.
                </p>

                <div class="bg-slate-50 p-3 sm:p-4 rounded-lg mx-auto max-w-xs text-left">
                  <p class="text-xs sm:text-sm text-slate-500 mb-1">Número de pedido:</p>
                  <p class="text-sm sm:text-base font-mono font-medium text-slate-800 mb-2 sm:mb-3">{purchaseData.orderNumber}</p>
                  <p class="text-xs sm:text-sm text-slate-500 mb-1">Hemos enviado los detalles a:</p>
                  <p class="text-sm sm:text-base font-medium text-slate-800">{purchaseData.email}</p>
                </div>

                {purchaseOption.value === 'gift' && (
                  <div class="bg-blue-50 p-3 sm:p-4 rounded-lg mx-auto max-w-xs text-left">
                    <p class="text-xs sm:text-sm text-blue-600 mb-1">Destinatario del regalo:</p>
                    <p class="text-sm sm:text-base font-medium text-slate-800">{purchaseData.giftEmail}</p>

                    {purchaseData.giftMessage && (
                      <>
                        <p class="text-xs sm:text-sm text-blue-600 mt-2 mb-1">Tu mensaje:</p>
                        <p class="text-xs sm:text-sm text-slate-700 italic">{purchaseData.giftMessage}</p>
                      </>
                    )}
                  </div>
                )}

                <button 
                  class="mx-auto mt-2 sm:mt-4 px-5 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-teal-400 to-blue-400 text-white rounded-lg hover:shadow-md transition-all duration-300"
                  onClick$={() => {
                    showPaymentModal.value = false;
                    showPurchaseModal.value = false;
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            )}

            {/* --- CERRAR MODAL --- */}
            <button 
              class="absolute top-2 right-2 sm:top-4 sm:right-4 text-slate-500 hover:text-slate-700 transition-colors" 
              aria-label="Cerrar"
              onClick$={() => showPaymentModal.value = false}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
});