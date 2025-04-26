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
  ref?: any; // Para permitir la referencia externa al SVG
}

/**
 * Componente IkigaiDiagram - Visualización interactiva del diagrama Ikigai
 * Versión premium con efectos visuales avanzados, brillos y partículas
 */
export default component$<IkigaiDiagramProps>(({ responses, convergenceIndex, ref }) => {
  const diagramRef = useSignal<SVGSVGElement>();
  const containerRef = useSignal<HTMLDivElement>();
  
  // Colores para cada círculo del Ikigai usando la nueva paleta
  const colors = {
    love: '#3b82f6',    // blue-500
    talent: '#14b8a6',  // teal-500
    need: '#a855f7',    // purple-500
    payment: '#6366f1'  // indigo-500
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
      
      return text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
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
    const margin = size * 0.1; // 10% de margen
    const diagramSize = size - (margin * 2);

    // Configurar el SVG con viewBox para mejor escalabilidad
    const svg = d3.select(svgElement)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Agregar marco de madera al diagrama
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

    // Rectángulo interior (área del contenido)
    svg.append('rect')
      .attr('x', frameWidth)
      .attr('y', frameWidth)
      .attr('width', size - (frameWidth * 2))
      .attr('height', size - (frameWidth * 2))
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('fill', 'white')
      .attr('stroke', '#9c7e52')
      .attr('stroke-width', 1);

    // Crear el grupo principal centrado (ajustado al marco)
    const g = svg.append('g')
      .attr('transform', `translate(${margin + frameWidth/2}, ${margin + frameWidth/2})`);

    // Radio de los círculos (ajustado al tamaño del diagrama)
    const circleRadius = (diagramSize - frameWidth) * 0.35;

    // Posiciones de los centros de los círculos (formato flor) - Intercambiamos talent y need
    const centers = {
      love: { x: diagramSize / 2, y: diagramSize * 0.25 },
      need: { x: diagramSize * 0.75, y: diagramSize / 2 }, // Movido al lado derecho
      payment: { x: diagramSize / 2, y: diagramSize * 0.75 },
      talent: { x: diagramSize * 0.25, y: diagramSize / 2 } // Movido al lado izquierdo
    };

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
      .attr('stdDeviation', '4')
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
      .attr('stdDeviation', '7')
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
        .attr('stop-color', d3.rgb(color).brighter(0.8).toString())
        .attr('stop-opacity', '0.3'); // Transparencia

      gradient.append('stop')
        .attr('offset', '80%')
        .attr('stop-color', color)
        .attr('stop-opacity', '0.3'); // Transparencia
        
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(color).darker(0.5).toString())
        .attr('stop-opacity', '0.3'); // Transparencia
        
      // Gradiente secundario para el contorno luminoso
      const glowGradient = defs.append('radialGradient')
        .attr('id', `glow-gradient-${key}`)
        .attr('cx', '0.5')
        .attr('cy', '0.5')
        .attr('r', '0.9')
        .attr('fx', '0.5')
        .attr('fy', '0.5');
        
      glowGradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', d3.rgb(color).brighter(0.5).toString())
        .attr('stop-opacity', '0.2'); // Más transparente
        
      glowGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(color).brighter(0.3).toString())
        .attr('stop-opacity', '0');
    });
    
    // Fondo sutil para mejorar la visibilidad
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0) 
      .attr('width', diagramSize)
      .attr('height', diagramSize)
      .attr('rx', 20)
      .attr('ry', 20)
      .attr('fill', 'white')
      .attr('fill-opacity', 1);
    
    // Reducimos la cantidad de partículas para un diseño más minimalista
    for (let i = 0; i < 15; i++) {
      const particleSize = Math.random() * 1.5 + 0.5; // Partículas más pequeñas
      const x = Math.random() * diagramSize;
      const y = Math.random() * diagramSize;
      const opacity = Math.random() * 0.2 + 0.1;
      
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', particleSize)
        .attr('fill', 'rgb(100,100,100)') // Color más sutil
        .attr('fill-opacity', opacity)
        .attr('class', 'particle')
        .style('animation', `sparkle ${Math.random() * 3 + 4}s infinite ${Math.random() * 2}s`);
    }

    // Dibujar los halos brillantes (detrás de los círculos)
    Object.entries(centers).forEach(([key, center]) => {
      g.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', circleRadius + 5)
        .attr('fill', `url(#glow-gradient-${key})`)
        .attr('filter', 'url(#soft-halo)')
        .attr('class', 'glow-circle')
        .style('opacity', 0.3)
        .style('animation', 'pulse-subtle 4s infinite');
    });

    // Dibujar los círculos principales con gradientes y efectos
    Object.entries(centers).forEach(([key, center]) => {
      g.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', circleRadius)
        .attr('fill', `url(#gradient-${key})`)
        .attr('fill-opacity', 0.6) // Más transparente
        .attr('stroke', colors[key as keyof typeof colors])
        .attr('stroke-width', 1.5) // Línea más fina, más minimalista
        .attr('stroke-opacity', 0.7) // Línea semi-transparente
        .attr('filter', 'url(#soft-halo)')
        .attr('class', 'ikigai-circle')
        .style('transition', 'all 0.5s ease');
      
      // Añadir etiquetas de los círculos
      const labels = {
        love: 'LO QUE TE MOTIVA',
        talent: 'ENTREGAS AL MUNDO',
        need: 'EN LO QUE ERES BUENO',
        payment: 'POR LO QUE TE PAGARÍAN'
      };
      
      // Posiciones ajustadas para las etiquetas
      let labelX = center.x;
      let labelY = center.y;
      
      switch(key) {
        case 'love':
          labelY -= circleRadius * 0.85;
          break;
        case 'need': // Antes era talent
          labelX += circleRadius * 0.85;
          break;
        case 'talent': // Antes era need
          labelX -= circleRadius * 0.85;
          break;
        case 'payment':
          labelY += circleRadius * 0.85;
          break;
      }
      
      g.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', diagramSize * 0.018)
        .attr('fill', colors[key as keyof typeof colors])
        .attr('filter', 'url(#soft-halo)')
        .attr('class', 'select-none pointer-events-none')
        .text(labels[key as keyof typeof labels]);
    });

    // Tokenizar las respuestas
    const loveTokens = tokenizeText(responses.love);
    const talentTokens = tokenizeText(responses.talent);
    const needTokens = tokenizeText(responses.need);
    const paymentTokens = tokenizeText(responses.payment);

    // Encontrar intersecciones
    const loveTalentIntersection = findIntersections(loveTokens, talentTokens);
    const loveNeedIntersection = findIntersections(loveTokens, needTokens);
    const lovePaymentIntersection = findIntersections(loveTokens, paymentTokens);
    const talentNeedIntersection = findIntersections(talentTokens, needTokens);
    const talentPaymentIntersection = findIntersections(talentTokens, paymentTokens);
    const needPaymentIntersection = findIntersections(needTokens, paymentTokens);

    // Intersecciones triples
    const loveTalentNeedIntersection = loveTalentIntersection.filter(word => needTokens.includes(word));
    const loveTalentPaymentIntersection = loveTalentIntersection.filter(word => paymentTokens.includes(word));
    const loveNeedPaymentIntersection = loveNeedIntersection.filter(word => paymentTokens.includes(word));
    const talentNeedPaymentIntersection = talentNeedIntersection.filter(word => paymentTokens.includes(word));

    // Intersección cuádruple (Ikigai)
    const ikigaiIntersection = loveTalentNeedIntersection.filter(word => paymentTokens.includes(word));

    // Función para colocar palabras en los círculos con efecto dinámico
    const placeWords = (words: string[], x: number, y: number, color: string) => {
      if (words.length === 0) return;

      const fontSize = diagramSize * 0.02; // Tamaño de fuente proporcional
      const spread = circleRadius * 0.6;
      const angleStep = (2 * Math.PI) / words.length;

      words.forEach((word, i) => {
        const angle = i * angleStep;
        const wordX = x + Math.cos(angle) * (Math.random() * spread * 0.8 + spread * 0.2);
        const wordY = y + Math.sin(angle) * (Math.random() * spread * 0.8 + spread * 0.2);

        // Texto con sombra
        g.append('text')
          .attr('x', wordX)
          .attr('y', wordY)
          .attr('text-anchor', 'middle')
          .attr('fill', d3.rgb(color).brighter(0.3).toString())
          .attr('font-size', fontSize)
          .attr('font-weight', 'bold')
          .attr('class', 'select-none pointer-events-none keyword-text')
          .attr('filter', 'url(#soft-halo)')
          .text(word)
          .style('opacity', 0)
          .transition()
          .duration(500)
          .delay(i * 50)
          .style('opacity', 0.5); // Menos opaco para un efecto más sutil
      });
    };

    // Colocar palabras en cada sección con animación suave
    Object.entries(centers).forEach(([key, center]) => {
      const tokens = key === 'love' ? loveTokens :
                    key === 'talent' ? talentTokens :
                    key === 'need' ? needTokens :
                    paymentTokens;
      
      placeWords(tokens, center.x, center.y, colors[key as keyof typeof colors]);
    });

    // Añadir etiquetas de las intersecciones con efectos premium
    const addIntersectionLabel = (text: string, x: number, y: number, color: string) => {
      // Círculo de fondo para la etiqueta
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', diagramSize * 0.045)
        .attr('fill', 'rgba(255,255,255,0.6)') // Fondo más claro y transparente
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('filter', 'url(#soft-halo)');
      
      g.append('text')
        .attr('x', x)
        .attr('y', y + diagramSize * 0.006) // Ajuste vertical para centrado visual
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', color)
        .attr('font-size', diagramSize * 0.025)
        .attr('font-weight', 'bold')
        .attr('class', 'select-none pointer-events-none')
        .attr('filter', 'url(#soft-halo)')
        .text(text);
    };

    // Añadir etiquetas en las intersecciones principales
    const midpoint = (a: {x: number, y: number}, b: {x: number, y: number}) => ({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    });

    // Añadir etiquetas de las intersecciones
    const intersectionLabels = {
      loveTalent: { text: "PASIÓN", pos: midpoint(centers.love, centers.talent) },
      loveNeed: { text: "MISIÓN", pos: midpoint(centers.love, centers.need) },
      talentPayment: { text: "PROFESIÓN", pos: midpoint(centers.talent, centers.payment) },
      needPayment: { text: "VOCACIÓN", pos: midpoint(centers.need, centers.payment) }
    };

    Object.entries(intersectionLabels).forEach(([key, { text, pos }]) => {
      addIntersectionLabel(text, pos.x, pos.y, intersectionColors[key as keyof typeof intersectionColors]);
    });

    // Añadir etiqueta central "IKIGAI" con efectos especiales si hay intersección
    // Centro del diagrama
    const centerX = diagramSize / 2;
    const centerY = diagramSize / 2;
    
    // Círculo de fondo brillante para IKIGAI
    g.append('circle')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', diagramSize * 0.06)
      .attr('fill', 'rgba(255,255,255,0.6)')
      .attr('stroke', intersectionColors.center)
      .attr('stroke-width', 2)
      .attr('filter', 'url(#soft-halo)')
      .style('animation', 'pulse-subtle 3s infinite');
    
    // Texto IKIGAI (más grande)
    g.append('text')
      .attr('x', centerX)
      .attr('y', centerY + diagramSize * 0.008) // Ajuste vertical
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', intersectionColors.center)
      .attr('font-size', diagramSize * 0.050) // Texto más grande
      .attr('font-weight', 'bold')
      .attr('class', 'select-none pointer-events-none')
      .attr('filter', 'url(#soft-halo)')
      .text("IKIGAI");
      
    // Palabras del Ikigai (si hay)
    if (ikigaiIntersection.length > 0) {
      ikigaiIntersection.forEach((word, i) => {
        const angle = (i / ikigaiIntersection.length) * 2 * Math.PI;
        const distance = diagramSize * 0.10; // Mayor distancia para acomodar texto central más grande
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        g.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('fill', intersectionColors.center)
          .attr('font-size', diagramSize * 0.030) // Más grande
          .attr('font-weight', 'bold')
          .attr('class', 'ikigai-keyword select-none pointer-events-none')
          .text(word)
          .style('opacity', 0)
          .transition()
          .duration(800)
          .delay(i * 100 + 500)
          .style('opacity', 0.8);
      });
    }
    
    // Minimizar el indicador de convergencia para un diseño más limpio
    if (convergenceIndex > 0 && false) { // Desactivado para un diseño más minimalista
      const gaugeRadius = diagramSize * 0.04;
      const gaugeX = margin * 0.5;
      const gaugeY = margin * 0.5;
      
      // Fondo del medidor
      g.append('circle')
        .attr('cx', gaugeX)
        .attr('cy', gaugeY)
        .attr('r', gaugeRadius)
        .attr('fill', 'rgba(255,255,255,0.7)')
        .attr('stroke', colors.love)
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.5);
      
      // Arco de progreso
      const arc = d3.arc()
        .innerRadius(gaugeRadius - 3)
        .outerRadius(gaugeRadius)
        .startAngle(0)
        .endAngle(convergenceIndex / 100 * 2 * Math.PI);
        
      g.append('path')
        .attr('d', arc as unknown as string)
        .attr('fill', colors.love)
        .attr('fill-opacity', 0.5)
        .attr('transform', `translate(${gaugeX}, ${gaugeY})`)
        .attr('filter', 'url(#soft-halo)')
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style('opacity', 0.7);
      
      // Texto de convergencia
      g.append('text')
        .attr('x', gaugeX)
        .attr('y', gaugeY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', colors.love)
        .attr('font-size', diagramSize * 0.018)
        .attr('font-weight', 'bold')
        .attr('class', 'select-none pointer-events-none')
        .text(`${Math.round(convergenceIndex)}%`);
    }
  });

  return (
    <div ref={containerRef} class="w-full h-full relative">
      <svg 
        ref={ref || diagramRef} 
        class="w-full h-full relative z-10"
      ></svg>
    </div>
  );
});