import { component$, useSignal } from '@builder.io/qwik';

// Interfaz para los props del componente
interface IkigaiCardProps {
  id: string;
  title: string;
  color: string;
  expanded: boolean;
  value: string;
  characterCount: number;
  motivationalMessage: string;
  onToggle$: (id: string) => void;
  onChange$: (value: string) => void;
  iconType: 'heart' | 'star' | 'globe' | 'money';
  step?: number;
  completed?: boolean;
  pulseAnimation?: boolean;
}

/**
 * Componente IkigaiCard - Tarjeta expandible premium para cada pregunta del Ikigai
 * Versión mejorada con efectos de cristal, animaciones y transiciones fluidas
 */
export default component$<IkigaiCardProps>((props) => {
  const { 
    id, 
    title, 
    color, 
    expanded, 
    value, 
    characterCount, 
    motivationalMessage,
    onToggle$,
    onChange$,
    iconType,
    step,
    completed,
    pulseAnimation
  } = props;

  const maxCharacters = 280;
  const inputRef = useSignal<HTMLTextAreaElement>();
  
  // Función para renderizar el icono apropiado
  const renderIcon = () => {
    switch (iconType) {
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'star':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'globe':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'money':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Obtener el color correspondiente para el tipo de tarjeta
  const getColor = () => {
    switch (color) {
      case 'ikigai-love':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          iconBg: 'bg-blue-500',
          hoverBorder: 'hover:border-blue-300'
        };
      case 'ikigai-talent':
        return {
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          text: 'text-teal-600',
          iconBg: 'bg-teal-500',
          hoverBorder: 'hover:border-teal-300'
        };
      case 'ikigai-need':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-600',
          iconBg: 'bg-purple-500',
          hoverBorder: 'hover:border-purple-300'
        };
      case 'ikigai-payment':
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-600',
          iconBg: 'bg-slate-500',
          hoverBorder: 'hover:border-slate-300'
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-600',
          iconBg: 'bg-slate-500',
          hoverBorder: 'hover:border-slate-300'
        };
    }
  };

  const colors = getColor();

  return (
    <div 
      class={`rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${colors.bg} border ${colors.border} ${expanded ? 'border-opacity-100' : 'border-opacity-70'} ${colors.hoverBorder}`}
    >
      {/* Cabecera de la tarjeta */}
      <div 
        class={`p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${expanded ? 'border-b border-slate-200' : ''}`}
        onClick$={() => onToggle$(id)}
      >
        <div class="flex items-center space-x-3">
          {/* Número de paso */}
          {step && (
            <div class={`w-8 h-8 rounded-full flex items-center justify-center border ${completed ? colors.iconBg : 'bg-white'} transition-colors duration-300`}>
              {completed ? (
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span class={`font-medium text-sm ${colors.text}`}>{step}</span>
              )}
            </div>
          )}
          
          {/* Icono y título */}
          <div class="flex items-center space-x-2">
            <div class={`w-8 h-8 rounded-full flex items-center justify-center ${colors.iconBg} text-white`}>
              {renderIcon()}
            </div>
            <h3 class={`font-medium ${colors.text}`}>{title}</h3>
          </div>
        </div>

        {/* Flecha de expansión */}
        <div class={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" class={`h-5 w-5 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Contenido expandible */}
      <div 
        class={`transition-all duration-300 overflow-hidden ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div class="p-4 space-y-3">
          {/* Mensaje motivacional */}
          <div class="text-slate-600 text-sm italic mb-3">
            {motivationalMessage}
          </div>

          {/* Área de texto */}
          <div class={`relative ${pulseAnimation ? 'animate-pulse-subtle' : ''}`}>
            <textarea
              ref={inputRef}
              value={value}
              onInput$={(e: any) => onChange$(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              class="w-full h-28 p-3 rounded-lg border border-slate-200 bg-white/80 text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-transparent transition-all duration-200"
            ></textarea>

            {/* Contador de caracteres */}
            <div class={`absolute bottom-2 right-2 text-xs font-medium transition-colors duration-300 ${characterCount > maxCharacters ? 'text-red-500' : 'text-slate-400'}`}>
              {characterCount}/{maxCharacters}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});