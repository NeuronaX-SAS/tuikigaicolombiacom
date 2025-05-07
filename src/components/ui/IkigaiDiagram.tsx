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
  
  // Colores para cada círculo del Ikigai (más suaves y translúcidos como en la nueva imagen)
  const colors = {
    love: '#7dd3fc',      // Light Sky Blue
    talent: '#6ee7b7',    // Light Emerald Green
    need: '#c4b5fd',      // Light Violet
    payment: '#a5b4fc'    // Light Indigo
  };
  
  // Colores para las intersecciones y texto (mantener contraste)
  const intersectionColors = {
    loveTalent: '#075985',      // Darker Sky Blue for Pasion
    loveNeed: '#5b21b6',        // Darker Violet for Mision
    talentPayment: '#047857',   // Darker Emerald for Profesion
    needPayment: '#3730a3',     // Darker Indigo for Vocacion
    center: '#1e3a8a'           // Dark Blue for IKIGAI text
  };

  // Renderizar el diagrama cuando cambian las respuestas o el tamaño
  useVisibleTask$(({ track }) => {
    track(() => responses);
    track(() => convergenceIndex);
    track(() => userName); // Seguir cambios en userName

    const svgElement = ref?.value || diagramRef.value;
    if (!svgElement) return;

    // Función para procesar texto de respuestas del usuario
    const processUserInputs = (text: string) => {
      if (!text || text.trim() === '') return [];
      
      // Dividir el texto en líneas o frases más cortas para mejor visualización
      return text.split(/[,;.]/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .slice(0, 5); // Limitar a 5 elementos para evitar sobrecarga visual
    };

    const findIntersections = (setA: string[], setB: string[]) => {
      return setA.filter(word => setB.includes(word));
    };

    d3.select(svgElement).selectAll('*').remove();

    const container = containerRef.value || svgElement.parentElement;
    const containerWidth = container?.clientWidth || 600;
    const containerHeight = container?.clientHeight || 600;
    const size = Math.min(containerWidth, containerHeight);
    const margin = size * 0.05;
    const diagramSize = size - (margin * 2);

    const svg = d3.select(svgElement)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${size} ${size}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const frameWidth = size * 0.05;
    svg.append('rect') // Marco exterior
      .attr('x', 0).attr('y', 0).attr('width', size).attr('height', size)
      .attr('rx', 5).attr('ry', 5).attr('fill', '#D2B48C') // Tono madera más claro (Tan)
      .attr('stroke', '#8C6B4F').attr('stroke-width', 1.5);

    const headerHeight = size * 0.12;
    const footerHeight = size * 0.12;

    svg.append('rect') // Área verde superior
      .attr('x', frameWidth).attr('y', frameWidth)
      .attr('width', size - (frameWidth * 2)).attr('height', headerHeight)
      .attr('fill', '#2F4F4F').attr('rx', 2).attr('ry', 2); // Dark Slate Gray (más sobrio)

    svg.append('rect') // Área verde inferior
      .attr('x', frameWidth).attr('y', size - frameWidth - footerHeight)
      .attr('width', size - (frameWidth * 2)).attr('height', footerHeight)
      .attr('fill', '#2F4F4F').attr('rx', 2).attr('ry', 2);

    svg.append('rect') // Área blanca central
      .attr('x', frameWidth).attr('y', frameWidth + headerHeight)
      .attr('width', size - (frameWidth * 2))
      .attr('height', size - (frameWidth * 2) - headerHeight - footerHeight)
      .attr('fill', 'white');

    const defs = svg.append('defs');
    // Gradientes para los círculos principales (más translúcidos)
    Object.entries(colors).forEach(([key, color]) => {
      const gradient = defs.append('radialGradient')
        .attr('id', `gradient-${key}`)
        .attr('cx', '50%').attr('cy', '50%').attr('r', '75%') // Gradiente más amplio
        .attr('fx', '50%').attr('fy', '50%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.rgb(color).brighter(0.3).toString())
        .attr('stop-opacity', '0.5'); // Opacidad base para el centro
        
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', d3.rgb(color).darker(0.3).toString())
        .attr('stop-opacity', '0.3'); // Opacidad en los bordes
    });
    
    // Centrando mejor el diagrama en el área disponible
    const contentWidth = size - (frameWidth * 2);
    const contentHeight = size - (frameWidth * 2) - headerHeight - footerHeight;
    const diagramAreaWidth = contentWidth * 0.9; // Usar 90% del ancho disponible
    const diagramAreaHeight = contentHeight * 0.9; // Usar 90% del alto disponible
    const finalDiagramSize = Math.min(diagramAreaWidth, diagramAreaHeight);
    
    const centerX = contentWidth / 2;
    const centerY = (contentHeight / 2) + headerHeight;
    
    const g = svg.append('g')
      .attr('transform', `translate(${frameWidth + centerX - finalDiagramSize/2}, ${frameWidth + centerY - finalDiagramSize/2})`);

    const circleRadius = finalDiagramSize * 0.38;

    const centers = {
      love: { x: finalDiagramSize / 2, y: finalDiagramSize * 0.25 },
      talent: { x: finalDiagramSize * 0.25, y: finalDiagramSize / 2 },
      need: { x: finalDiagramSize * 0.75, y: finalDiagramSize / 2 },
      payment: { x: finalDiagramSize / 2, y: finalDiagramSize * 0.75 }
    };
    
    // Texto del nombre del usuario en la cabecera
    svg.append('text')
      .attr('x', size / 2).attr('y', frameWidth + headerHeight * 0.5)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', 'white').attr('font-size', headerHeight * 0.5) // Tamaño relativo a la cabecera
      .attr('font-weight', 'bold').attr('font-family', 'sans-serif')
      .text(userName && userName.trim() ? userName : "Name"); // Default "Name" como en la imagen

    // Texto e logo en el pie
    const logoSize = footerHeight * 0.4;
    // Centrado del footer
    const footerTextX = size / 2;
    const logoX = footerTextX - (size - frameWidth * 2) * 0.25;
    const logoY = size - frameWidth - footerHeight/2;

    const logoGroup = svg.append('g').attr('transform', `translate(${logoX}, ${logoY}) scale(${logoSize/50})`);
    logoGroup.append('circle').attr('cx', 25).attr('cy', 25).attr('r', 23).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.8)').attr('stroke-width', 2);
    logoGroup.append('ellipse').attr('cx', 25).attr('cy', 25).attr('rx', 23).attr('ry', 10).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.8)').attr('stroke-width', 1.5).attr('transform', 'rotate(30 25 25)');
    logoGroup.append('ellipse').attr('cx', 25).attr('cy', 25).attr('rx', 23).attr('ry', 10).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.8)').attr('stroke-width', 1.5).attr('transform', 'rotate(-30 25 25)');

    svg.append('text')
      .attr('x', footerTextX)
      .attr('y', logoY + 2)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', 'white').attr('font-size', footerHeight * 0.35)
      .attr('font-weight', 'bold').attr('font-family', 'sans-serif')
      .text("TU IKIGAI");
      
    svg.append('text')
      .attr('x', footerTextX)
      .attr('y', logoY + footerHeight * 0.35)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', 'rgba(255,255,255,0.8)').attr('font-size', footerHeight * 0.22)
      .attr('font-style', 'italic').attr('font-family', 'sans-serif')
      .text('"La frase que representa tu propósito de vida"');

    // Dibujar los círculos principales
    Object.entries(centers).forEach(([key, center]) => {
      g.append('circle')
        .attr('cx', center.x).attr('cy', center.y).attr('r', circleRadius)
        .attr('fill', `url(#gradient-${key})`)
        .attr('stroke', d3.rgb(colors[key as keyof typeof colors]).darker(0.5).toString())
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.6);
    });

    // Procesar las respuestas
    const loveResponses = processUserInputs(responses.love);
    const talentResponses = processUserInputs(responses.talent);
    const needResponses = processUserInputs(responses.need);
    const paymentResponses = processUserInputs(responses.payment);

    // Renderizar respuestas del usuario dentro de los círculos
    const displayUserResponses = (items: string[], center: {x: number, y: number}, key: string) => {
      if (items.length === 0) return;
      
      // Configuraciones específicas para cada círculo
      let positionX = center.x;
      let positionY = center.y;
      const fontSize = finalDiagramSize * 0.026;
      const lineHeight = fontSize * 1.3;
      
      // Calcular mejor posición según el área para evitar solapamientos
      // y mantener el contenido dentro de cada círculo
      const yOffset = items.length * lineHeight / 2;
      
      switch(key) {
        case 'love':
          positionY = center.y - yOffset + circleRadius * 0.2;
          break;
        case 'talent':
          positionX = center.x - circleRadius * 0.15;
          positionY = center.y - yOffset;
          break;
        case 'need':
          positionX = center.x + circleRadius * 0.15;
          positionY = center.y - yOffset;
          break;
        case 'payment':
          positionY = center.y - yOffset - circleRadius * 0.2;
          break;
      }
      
      // Calcular el ancho óptimo para cada área
      let maxWidthPercent = 0;
      switch(key) {
        case 'love':
        case 'payment':
          maxWidthPercent = 0.65; // 65% del radio para áreas superior e inferior
          break;
        case 'talent':
        case 'need':
          maxWidthPercent = 0.6; // 60% del radio para áreas laterales
          break;
      }
      
      // Calcular el ancho basado en el texto y el área disponible
      const maxWidth = Math.min(
        circleRadius * maxWidthPercent * 2, // Limitar según el área disponible
        Math.max(100, items.reduce((max, item) => Math.max(max, Math.min(item.length * fontSize * 0.5, circleRadius)), 0))
      );
      
      // Ajustar el texto si es demasiado largo
      const adjustedItems = items.map(item => {
        // Estimar el número de caracteres que caben en el ancho disponible
        const maxChars = Math.floor(maxWidth / (fontSize * 0.5));
        if (item.length > maxChars) {
          return item.substring(0, maxChars - 3) + '...';
        }
        return item;
      });
      
      // Calcular la altura basada en el número de líneas
      const padding = { x: 12, y: 8 };
      const bgHeight = (items.length * lineHeight) + padding.y * 2;
      
      // Crear grupo para la respuesta
      const responseGroup = g.append('g')
        .attr('transform', `translate(${positionX}, ${positionY})`);
      
      // Fondo con mejor estilo visual
      responseGroup.append('rect')
        .attr('x', -maxWidth/2)
        .attr('y', -bgHeight/2)
        .attr('width', maxWidth)
        .attr('height', bgHeight)
        .attr('rx', 12)
        .attr('ry', 12)
        .attr('fill', 'rgba(255,255,255,0.9)')
        .attr('stroke', d3.rgb(colors[key as keyof typeof colors]).darker(0.5).toString())
        .attr('stroke-width', 1.5)
        .attr('filter', 'drop-shadow(0px 2px 3px rgba(0,0,0,0.12))');
      
      // Renderizar las respuestas línea por línea con mejor estilo
      adjustedItems.forEach((item, i) => {
        const textY = (i - (items.length - 1) / 2) * lineHeight;
        responseGroup.append('text')
          .attr('x', 0)
          .attr('y', textY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', d3.rgb(colors[key as keyof typeof colors]).darker(1.7).toString()) // Color más oscuro para mejor contraste
          .attr('font-size', fontSize)
          .attr('font-weight', '600')
          .attr('font-family', 'sans-serif')
          .text(item)
          .style('opacity', 0)
          .transition().duration(300).delay(i * 100).style('opacity', 1);
      });
    };
    
    displayUserResponses(loveResponses, centers.love, 'love');
    displayUserResponses(talentResponses, centers.talent, 'talent');
    displayUserResponses(needResponses, centers.need, 'need');
    displayUserResponses(paymentResponses, centers.payment, 'payment');

    // Key Labels (Amas, Tienes, etc.) dentro de pequeños círculos
    const keyLabelRadius = finalDiagramSize * 0.035;
    const keyLabelFontSize = finalDiagramSize * 0.022;
    
    // Nuevos textos para las etiquetas según lo solicitado
    const keyLabels = {
      love: "Amas",
      talent: "Tienes",
      need: "Ofreces",
      payment: "Ganas"
    };
    
    Object.keys(centers).forEach(key => {
        const c = centers[key as keyof typeof centers];
        let labelX = c.x, labelY = c.y;
        // Ajustar posición para asegurar que estén dentro de los círculos
        const distanceFromEdge = circleRadius * 0.25; // 25% del radio desde el borde
        
        if (key === 'love') labelY = c.y - circleRadius + distanceFromEdge;
        if (key === 'talent') labelX = c.x - circleRadius + distanceFromEdge;
        if (key === 'need') labelX = c.x + circleRadius - distanceFromEdge;
        if (key === 'payment') labelY = c.y + circleRadius - distanceFromEdge;

        // Fondo del círculo y borde
        g.append('circle')
            .attr('cx', labelX).attr('cy', labelY).attr('r', keyLabelRadius)
            .attr('fill', '#f1f5f9') // Light gray background
            .attr('stroke', d3.rgb(colors[key as keyof typeof colors]).darker(0.7).toString())
            .attr('stroke-width', 1);
        
        // Texto de la etiqueta
        g.append('text')
            .attr('x', labelX).attr('y', labelY)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
            .attr('font-size', keyLabelFontSize).attr('fill', d3.rgb(colors[key as keyof typeof colors]).darker(1).toString())
            .attr('font-weight', 'bold').attr('font-family', 'sans-serif')
            .text(keyLabels[key as keyof typeof keyLabels]);
    });

    // Etiquetas de Intersección (PASIÓN, MISIÓN, etc.)
    const addIntersectionLabel = (text: string, x: number, y: number, colorValue: string, angle: number = 0) => {
      const group = g.append('g').attr('transform', `translate(${x},${y}) rotate(${angle})`);
      const padding = { x: finalDiagramSize * 0.015, y: finalDiagramSize * 0.008 }; // Padding para el fondo
      const textElement = group.append('text')
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', colorValue).attr('font-size', finalDiagramSize * 0.028)
        .attr('font-weight', '600').attr('font-family', 'sans-serif').text(text);
      
      const bbox = (textElement.node() as SVGTextElement).getBBox();
      group.insert('rect', 'text') // Insertar el rect detrás del texto
        .attr('x', bbox.x - padding.x)
        .attr('y', bbox.y - padding.y)
        .attr('width', bbox.width + padding.x * 2)
        .attr('height', bbox.height + padding.y * 2)
        .attr('rx', finalDiagramSize * 0.01).attr('ry', finalDiagramSize * 0.01)
        .attr('fill', 'rgba(255,255,255,0.85)') // Fondo blanco translúcido
        .attr('stroke', d3.rgb(colorValue).darker(0.3).toString()).attr('stroke-width', 0.5);
    };

    const midpoint = (a: {x: number, y: number}, b: {x: number, y: number}) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const intersectionLabels = [
      { text: "PASIÓN", pos: midpoint(centers.love, centers.talent), color: intersectionColors.loveTalent, angle: -45 },
      { text: "MISIÓN", pos: midpoint(centers.love, centers.need), color: intersectionColors.loveNeed, angle: 45 },
      { text: "PROFESIÓN", pos: midpoint(centers.talent, centers.payment), color: intersectionColors.talentPayment, angle: 45 },
      { text: "VOCACIÓN", pos: midpoint(centers.need, centers.payment), color: intersectionColors.needPayment, angle: -45 }
    ];
    intersectionLabels.forEach(({ text, pos, color, angle }) => addIntersectionLabel(text, pos.x, pos.y, color, angle));

    // Etiqueta central "IKIGAI"
    const ikigaiCenterX = finalDiagramSize / 2;
    const ikigaiCenterY = finalDiagramSize / 2;
    const ikigaiLabelGroup = g.append('g').attr('transform', `translate(${ikigaiCenterX},${ikigaiCenterY})`);
    const ikigaiText = ikigaiLabelGroup.append('text')
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', intersectionColors.center).attr('font-size', finalDiagramSize * 0.045)
        .attr('font-weight', 'bold').attr('font-family', 'sans-serif').text("IKIGAI");
    const ikigaiBBox = (ikigaiText.node() as SVGTextElement).getBBox();
    ikigaiLabelGroup.insert('circle', 'text')
        .attr('r', Math.max(ikigaiBBox.width, ikigaiBBox.height) * 0.75) // Radio basado en el tamaño del texto
        .attr('fill', 'rgba(255,255,255,0.9)') // Fondo blanco más opaco
        .attr('stroke', d3.rgb(intersectionColors.center).darker(0.5).toString()).attr('stroke-width', 1.5);
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