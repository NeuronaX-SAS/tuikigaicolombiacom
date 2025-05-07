import { component$, useVisibleTask$, useSignal } from '@builder.io/qwik';
import * as d3 from 'd3';

// Interfaz para los props del componente
interface IkigaiDiagramProps {
  responses: {
    love: string;
    talent: string;
    need: string;
    payment: string;
  };
  convergenceIndex: number;
  userName?: string; // Nombre de usuario opcional
  ref?: any; // Para permitir la referencia externa al SVG
}

/**
 * Componente IkigaiDiagram - Visualización interactiva del diagrama Ikigai
 * Versión premium con efectos visuales avanzados, brillos y partículas
 */
export default component$<IkigaiDiagramProps>(({ responses, convergenceIndex, userName, ref }) => {
  const diagramRef = useSignal<SVGSVGElement>();
  const containerRef = useSignal<HTMLDivElement>();
  
  // Colores para cada círculo del Ikigai usando la nueva paleta
  const colors = {
    love: '#3b82f6',      // blue-500
    talent: '#14b8a6',    // teal-500 
    need: '#a855f7',      // purple-500
    payment: '#6366f1'    // indigo-500
  };
  
  // Colores para las intersecciones y texto
  const intersectionColors = {
    loveTalent: '#2563eb',      // blue-600
    loveNeed: '#7c3aed',        // violet-600
    talentPayment: '#0d9488',   // teal-600
    needPayment: '#4f46e5',     // indigo-600
    center: '#1e40af'           // blue-800
  };

  // Renderizar el diagrama cuando cambian las respuestas o el tamaño
  useVisibleTask$(({ track }) => {
    track(() => responses);
    track(() => convergenceIndex);

    const svgElement = ref?.value || diagramRef.value;
    if (!svgElement) return;

    // Función para tokenizar y limpiar texto
    const tokenizeText = (text: string) => {
      if (!text) return [];
      
      const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'porque', 'como', 'que', 'para', 'por', 'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'en', 'entre', 'hacia', 'hasta', 'según', 'sin', 'sobre', 'tras'];
      
      // Extraer palabras significativas, evitando palabras vacías
      let tokens = text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
      
      // Limitar a máximo 10 palabras para evitar sobrecarga visual
      return tokens.slice(0, 10);
    };

    // Función para encontrar intersecciones entre conjuntos
    const findIntersections = (setA: string[], setB: string[]) => {
      return setA.filter(word => setB.includes(word));
    };

    // Limpiar el SVG existente
    d3.select(svgElement).selectAll('*').remove();

    // Obtener el tamaño del contenedor padre
    const container = containerRef.value || svgElement.parentElement;
    const containerWidth = container?.clientWidth || 600;
    const containerHeight = container?.clientHeight || 600;

    // Calcular el tamaño del diagrama manteniendo el aspecto cuadrado
    const size = Math.min(containerWidth, containerHeight);
    const margin = size * 0.05; // Reducido para aprovechar más espacio
    const diagramSize = size - (margin * 2);

    // Configurar el SVG con viewBox para mejor escalabilidad
    const svg = d3.select(svgElement)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Agregar marco de madera al diagrama (similar a la imagen de referencia)
    const frameWidth = size * 0.05; // Ancho del marco
    
    // Rectángulo exterior (marco completo)
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', size)
      .attr('height', size)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', '#c2a37c') // Color madera claro
      .attr('stroke', '#9c7e52') // Borde más oscuro
      .attr('stroke-width', 1);
    
    // Efecto de veta de madera
    const woodGrain = svg.append('filter')
      .attr('id', 'wood-grain')
      .attr('x', '0%')
      .attr('y', '0%')
      .attr('width', '100%')
      .attr('height', '100%');
      
    woodGrain.append('feTurbulence')
      .attr('type', 'fractalNoise')
      .attr('baseFrequency', '0.03')
      .attr('numOctaves', '3')
      .attr('seed', '1')
      .attr('result', 'noise');
      
    woodGrain.append('feDisplacementMap')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'noise')
      .attr('scale', '3')
      .attr('xChannelSelector', 'R')
      .attr('yChannelSelector', 'G');
    
    // Aplicar vetas a los bordes del marco
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', size)
      .attr('height', size)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', 'none')
      .attr('stroke', '#9c7e52')
      .attr('stroke-width', 1)
      .attr('filter', 'url(#wood-grain)');

    // Crear áreas verdes en la parte superior e inferior (como en la imagen de referencia)
    const headerHeight = size * 0.12;
    const footerHeight = size * 0.12;
    
    // Área verde superior
    svg.append('rect')
      .attr('x', frameWidth)
      .attr('y', frameWidth)
      .attr('width', size - (frameWidth * 2))
      .attr('height', headerHeight)
      .attr('fill', '#2d6a4f') // Verde oscuro para la cabecera
      .attr('rx', 2)
      .attr('ry', 2);
      
    // Área verde inferior
    svg.append('rect')
      .attr('x', frameWidth)
      .attr('y', size - frameWidth - footerHeight)
      .attr('width', size - (frameWidth * 2))
      .attr('height', footerHeight)
      .attr('fill', '#2d6a4f') // Verde oscuro para el pie
      .attr('rx', 2)
      .attr('ry', 2);
    
    // Área blanca central para el diagrama
    svg.append('rect')
      .attr('x', frameWidth)
      .attr('y', frameWidth + headerHeight)
      .attr('width', size - (frameWidth * 2))
      .attr('height', size - (frameWidth * 2) - headerHeight - footerHeight)
      .attr('fill', 'white')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 0.5);

    // Crear filtros para efectos visuales avanzados
    const defs = svg.append('defs');

    // Filtro de resplandor premium
    const glow = defs.append('filter')
      .attr('id', 'glow-premium')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glow.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');

    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
      
    // Filtro para efecto de halo suave
    const halo = defs.append('filter')
      .attr('id', 'soft-halo')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
      
    halo.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
      
    halo.append('feFlood')
      .attr('flood-color', 'white')
      .attr('flood-opacity', '0.2')
      .attr('result', 'color');
      
    halo.append('feComposite')
      .attr('in', 'color')
      .attr('in2', 'blur')
      .attr('operator', 'in')
      .attr('result', 'shadow');
      
    const feMergeHalo = halo.append('feMerge');
    feMergeHalo.append('feMergeNode')
      .attr('in', 'shadow');
    feMergeHalo.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Crea un filtro para contornos más definidos
    const outlineFilter = defs.append('filter')
      .attr('id', 'outline')
      .attr('x', '-10%')
      .attr('y', '-10%')
      .attr('width', '120%')
      .attr('height', '120%');
      
    outlineFilter.append('feMorphology')
      .attr('operator', 'dilate')
      .attr('radius', '1')
      .attr('in', 'SourceAlpha')
      .attr('result', 'thicken');
      
    outlineFilter.append('feFlood')
      .attr('flood-color', '#4b5563')
      .attr('result', 'outlineColor');
      
    outlineFilter.append('feComposite')
      .attr('in', 'outlineColor')
      .attr('in2', 'thicken')
      .attr('operator', 'in')
      .attr('result', 'outline');
      
    const feMergeOutline = outlineFilter.append('feMerge');
    feMergeOutline.append('feMergeNode')
      .attr('in', 'outline');
    feMergeOutline.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Gradientes radiales sofisticados para cada círculo
    Object.entries(colors).forEach(([key, color]) => {
      // Gradiente principal con efecto 3D
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${key}`)
        .attr('cx', '0.5')
        .attr('cy', '0.5')
        .attr('r', '0.5')
        .attr('fx', '0.35')
        .attr('fy', '0.35');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.rgb(color).brighter(0.5).toString())
        .attr('stop-opacity', '0.25'); // Transparencia

      gradient.append('stop')
        .attr('offset', '80%')
        .attr('stop-color', color)
        .attr('stop-opacity', '0.25'); // Transparencia
        
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(color).darker(0.3).toString())
        .attr('stop-opacity', '0.25'); // Transparencia
    });
    
    // Crear el grupo principal centrado y ajustado para acomodar los elementos de cabecera y pie
    const g = svg.append('g')
      .attr('transform', `translate(${margin + frameWidth}, ${margin + frameWidth + headerHeight})`);

    // Ajustar el tamaño del área de dibujo del diagrama para dejar espacio para cabecera y pie
    const adjustedDiagramSize = size - (frameWidth * 2) - margin * 2 - headerHeight - footerHeight;
    
    // Radio de los círculos (ajustado al tamaño del diagrama)
    const circleRadius = adjustedDiagramSize * 0.38;

    // Posiciones de los centros de los círculos (formato flor)
    const centers = {
      love: { x: adjustedDiagramSize / 2, y: adjustedDiagramSize * 0.22 },
      talent: { x: adjustedDiagramSize * 0.22, y: adjustedDiagramSize / 2 },
      need: { x: adjustedDiagramSize * 0.78, y: adjustedDiagramSize / 2 },
      payment: { x: adjustedDiagramSize / 2, y: adjustedDiagramSize * 0.78 }
    };

    // Nombres de los círculos y posición
    const circleLabels = {
      love: { text: "Lo que te motiva", pos: { x: centers.love.x, y: adjustedDiagramSize * 0.08 } },
      talent: { text: "Entregas al mundo", pos: { x: adjustedDiagramSize * 0.08, y: centers.talent.y } },
      need: { text: "En lo que eres bueno", pos: { x: adjustedDiagramSize * 0.92, y: centers.need.y } },
      payment: { text: "Por lo que te pagarían", pos: { x: centers.payment.x, y: adjustedDiagramSize * 0.92 } }
    };

    // Añadir etiquetas centradas en los bordes (como en la imagen)
    svg.append('text')
      .attr('x', size / 2)
      .attr('y', frameWidth + headerHeight * 0.55)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', headerHeight * 0.45)
      .attr('font-weight', 'bold')
      .text(userName && userName.trim() ? userName : "Tu nombre");
    
    // Texto del pie con logo y frase
    // Logo "átomo" de TUIKIGAI
    const logoSize = footerHeight * 0.5;
    const logoX = frameWidth + (size - frameWidth * 2) * 0.15;
    const logoY = size - frameWidth - footerHeight/2;
    
    // Crear átomo simple como logo
    svg.append('circle')
      .attr('cx', logoX)
      .attr('cy', logoY)
      .attr('r', logoSize/2)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.7)')
      .attr('stroke-width', 1.5);
      
    svg.append('ellipse')
      .attr('cx', logoX)
      .attr('cy', logoY)
      .attr('rx', logoSize/2)
      .attr('ry', logoSize/4)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.7)')
      .attr('stroke-width', 1)
      .attr('transform', `rotate(30, ${logoX}, ${logoY})`);
      
    svg.append('ellipse')
      .attr('cx', logoX)
      .attr('cy', logoY)
      .attr('rx', logoSize/2)
      .attr('ry', logoSize/4)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.7)')
      .attr('stroke-width', 1)
      .attr('transform', `rotate(-30, ${logoX}, ${logoY})`);

    // Texto "TU IKIGAI"
    svg.append('text')
      .attr('x', logoX + logoSize * 1.2)
      .attr('y', logoY + logoSize * 0.12)
      .attr('text-anchor', 'left')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', logoSize * 0.9)
      .attr('font-weight', 'bold')
      .text("TU IKIGAI");
      
    // Frase de propósito en la parte inferior
    svg.append('text')
      .attr('x', size / 2)
      .attr('y', size - frameWidth - footerHeight/2 + logoSize * 0.6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', logoSize * 0.5)
      .attr('font-style', 'italic')
      .text('"La frase que representa tu propósito de vida"');

    // Dibujar los círculos principales con gradientes y efectos, usando más opacidad para mejor visualización
    Object.entries(centers).forEach(([key, center]) => {
      g.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', circleRadius)
        .attr('fill', `url(#gradient-${key})`)
        .attr('stroke', colors[key as keyof typeof colors])
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.7)
        .attr('class', 'ikigai-circle');
    });

    // Añadir etiquetas de los círculos con mejor posicionamiento
    Object.entries(circleLabels).forEach(([key, {text, pos}]) => {
      // Añadir la etiqueta circular arriba (como en la imagen de referencia)
      const labelBgRadius = 15;
      g.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', labelBgRadius)
        .attr('fill', '#e2e8f0')
        .attr('stroke', colors[key as keyof typeof colors])
        .attr('stroke-width', 1.5);
      
      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', adjustedDiagramSize * 0.018)
        .attr('fill', '#334155')
        .attr('font-weight', 'bold')
        .attr('class', 'select-none pointer-events-none')
        .text(key.toUpperCase());
      
      // Añadir el texto principal en el centro del círculo
      g.append('text')
        .attr('x', centers[key as keyof typeof centers].x)
        .attr('y', centers[key as keyof typeof centers].y)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', adjustedDiagramSize * 0.022)
        .attr('fill', colors[key as keyof typeof colors])
        .attr('font-weight', 'bold')
        .attr('class', 'select-none pointer-events-none main-label')
        .text(text);
    });

    // Tokenizar las respuestas
    const loveTokens = tokenizeText(responses.love);
    const talentTokens = tokenizeText(responses.talent);
    const needTokens = tokenizeText(responses.need);
    const paymentTokens = tokenizeText(responses.payment);

    // Función mejorada para colocar palabras en los círculos con distribución controlada
    const placeWords = (words: string[], centerX: number, centerY: number, color: string, radius: number) => {
      if (words.length === 0) return;

      // Calcular el tamaño de fuente basado en el tamaño del diagrama y la cantidad de palabras
      const baseFontSize = adjustedDiagramSize * 0.018;
      const fontSize = Math.max(baseFontSize * (1 - words.length/20), baseFontSize * 0.7);
      
      // Definir una distribución radial para ubicar las palabras
      const numWords = words.length;
      const angleStep = (Math.PI * 2) / numWords;
      const innerRadius = radius * 0.35; // Mantener alejado del centro
      const outerRadius = radius * 0.7;  // No llegar hasta el borde
      
      // Crear elementos de texto para cada palabra
      words.forEach((word, i) => {
        // Calcular ángulo para distribución uniforme
        const angle = i * angleStep;
        
        // Variar la distancia para evitar un patrón demasiado regular
        const distance = innerRadius + (Math.random() * (outerRadius - innerRadius));
        
        // Calcular posición
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Añadir texto con estilo mejorado y contorno para legibilidad
        g.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', color)
          .attr('font-size', fontSize)
          .attr('font-weight', 'bold')
          .attr('stroke', 'white')
          .attr('stroke-width', 0.7)
          .attr('paint-order', 'stroke')
          .attr('class', 'word-label')
          .style('opacity', 0)
          .text(word)
          .transition()
          .duration(500)
          .delay(i * 50)
          .style('opacity', 1);
      });
    };

    // Colocar palabras en cada sección con animación suave
    placeWords(loveTokens, centers.love.x, centers.love.y, colors.love, circleRadius);
    placeWords(talentTokens, centers.talent.x, centers.talent.y, colors.talent, circleRadius);
    placeWords(needTokens, centers.need.x, centers.need.y, colors.need, circleRadius);
    placeWords(paymentTokens, centers.payment.x, centers.payment.y, colors.payment, circleRadius);

    // Añadir etiquetas en las intersecciones principales con mejores efectos visuales
    const addIntersectionLabel = (text: string, x: number, y: number, color: string, angle: number = 0) => {
      // Crear un contenedor con rotación para el texto
      const group = g.append('g')
        .attr('transform', `translate(${x}, ${y}) rotate(${angle})`);
      
      // Rectángulo con esquinas redondeadas como fondo
      group.append('rect')
        .attr('x', -adjustedDiagramSize * 0.06)
        .attr('y', -adjustedDiagramSize * 0.02)
        .attr('width', adjustedDiagramSize * 0.12)
        .attr('height', adjustedDiagramSize * 0.04)
        .attr('rx', adjustedDiagramSize * 0.01)
        .attr('ry', adjustedDiagramSize * 0.01)
        .attr('fill', 'white')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('filter', 'url(#soft-halo)');
      
      // Texto centrado
      group.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', color)
        .attr('font-size', adjustedDiagramSize * 0.025)
        .attr('font-weight', 'bold')
        .attr('class', 'intersection-label')
        .text(text);
    };

    // Calcular los puntos medios para las intersecciones
    const midpoint = (a: {x: number, y: number}, b: {x: number, y: number}) => ({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    });

    // Dibujar las etiquetas de intersección con ángulos ajustados
    const intersectionLabels = [
      { text: "PASIÓN", pos: midpoint(centers.love, centers.talent), color: intersectionColors.loveTalent, angle: -45 },
      { text: "MISIÓN", pos: midpoint(centers.love, centers.need), color: intersectionColors.loveNeed, angle: 45 },
      { text: "PROFESIÓN", pos: midpoint(centers.talent, centers.payment), color: intersectionColors.talentPayment, angle: 45 },
      { text: "VOCACIÓN", pos: midpoint(centers.need, centers.payment), color: intersectionColors.needPayment, angle: -45 }
    ];

    intersectionLabels.forEach(({ text, pos, color, angle }) => {
      addIntersectionLabel(text, pos.x, pos.y, color, angle);
    });

    // Añadir etiqueta central "IKIGAI" con mejores efectos
    const centerX = adjustedDiagramSize / 2;
    const centerY = adjustedDiagramSize / 2;
    
    // Círculo central con efecto de brillo
    g.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', adjustedDiagramSize * 0.06)
      .attr('fill', 'white')
      .attr('stroke', intersectionColors.center)
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow-premium)');
    
    // Texto IKIGAI en el centro
    g.append('text')
      .attr('x', centerX)
      .attr('y', centerY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', intersectionColors.center)
      .attr('font-size', adjustedDiagramSize * 0.035)
      .attr('font-weight', 'bold')
      .attr('class', 'select-none pointer-events-none')
      .text("IKIGAI");
    
    // Encontrar palabras que aparecen en múltiples áreas
    const loveTalentIntersection = findIntersections(loveTokens, talentTokens);
    const loveNeedIntersection = findIntersections(loveTokens, needTokens);
    const talentPaymentIntersection = findIntersections(talentTokens, paymentTokens);
    const needPaymentIntersection = findIntersections(needTokens, paymentTokens);

    // Intersección cuádruple (auténtico Ikigai)
    const centerIntersection = loveTokens.filter(word => 
      talentTokens.includes(word) && 
      needTokens.includes(word) && 
      paymentTokens.includes(word)
    );

    // Si hay palabras en la intersección central, mostrarlas alrededor del centro
    if (centerIntersection.length > 0) {
      const radius = adjustedDiagramSize * 0.12;
      placeWords(centerIntersection, centerX, centerY, intersectionColors.center, radius);
    }
  });

  return (
    <div ref={containerRef} class="w-full h-full relative">
      <svg 
        ref={ref || diagramRef} 
        class="w-full h-full relative z-10"
      ></svg>
      <style>{`
        @keyframes pulse-subtle {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        .word-label {
          transition: all 0.3s ease;
        }
        .intersection-label {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
});