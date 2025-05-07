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

    // Función para tokenizar y limpiar texto
    const tokenizeText = (text: string) => {
      if (!text) return [];
      const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero', 'porque', 'como', 'que', 'para', 'por', 'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'en', 'entre', 'hacia', 'hasta', 'según', 'sin', 'sobre', 'tras'];
      let tokens = text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word));
      return tokens.slice(0, 8); // Limitar a 8 palabras para mejor visualización
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
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin + frameWidth}, ${margin + frameWidth + headerHeight})`);

    const adjustedDiagramSize = size - (frameWidth * 2) - margin * 2 - headerHeight - footerHeight;
    const circleRadius = adjustedDiagramSize * 0.38;

    const centers = {
      love: { x: adjustedDiagramSize / 2, y: adjustedDiagramSize * 0.25 }, // Ajuste para más espacio arriba
      talent: { x: adjustedDiagramSize * 0.25, y: adjustedDiagramSize / 2 },
      need: { x: adjustedDiagramSize * 0.75, y: adjustedDiagramSize / 2 },
      payment: { x: adjustedDiagramSize / 2, y: adjustedDiagramSize * 0.75 }
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
    const logoX = frameWidth + (size - frameWidth * 2) * 0.1;
    const logoY = size - frameWidth - footerHeight/2;

    const logoGroup = svg.append('g').attr('transform', `translate(${logoX}, ${logoY}) scale(${logoSize/50})`);
    logoGroup.append('circle').attr('cx', 25).attr('cy', 25).attr('r', 23).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.8)').attr('stroke-width', 2);
    logoGroup.append('ellipse').attr('cx', 25).attr('cy', 25).attr('rx', 23).attr('ry', 10).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.8)').attr('stroke-width', 1.5).attr('transform', 'rotate(30 25 25)');
    logoGroup.append('ellipse').attr('cx', 25).attr('cy', 25).attr('rx', 23).attr('ry', 10).attr('fill', 'none').attr('stroke', 'rgba(255,255,255,0.8)').attr('stroke-width', 1.5).attr('transform', 'rotate(-30 25 25)');

    svg.append('text')
      .attr('x', logoX + logoSize * 1.2 + 5)
      .attr('y', logoY + 2)
      .attr('text-anchor', 'left').attr('dominant-baseline', 'middle')
      .attr('fill', 'white').attr('font-size', footerHeight * 0.35)
      .attr('font-weight', 'bold').attr('font-family', 'sans-serif')
      .text("TU IKIGAI");
      
    svg.append('text')
      .attr('x', logoX + logoSize * 1.2 + 5)
      .attr('y', logoY + footerHeight * 0.35)
      .attr('text-anchor', 'left').attr('dominant-baseline', 'middle')
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

    // Textos principales dentro de los círculos (e.g., "Lo que te motiva")
    const mainLabelsData = {
        love: { text: "Lo que te motiva", color: colors.love },
        talent: { text: "Entregas al mundo", color: colors.talent },
        need: { text: "En lo que eres bueno", color: colors.need },
        payment: { text: "Por lo que te pagarían", color: colors.payment }
    };

    Object.entries(mainLabelsData).forEach(([key, { text, color }]) => {
        g.append('text')
            .attr('x', centers[key as keyof typeof centers].x)
            .attr('y', centers[key as keyof typeof centers].y - circleRadius * 0.55) // Posición ajustada dentro del círculo
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', adjustedDiagramSize * 0.032) // Tamaño de fuente aumentado
            .attr('fill', d3.rgb(color).darker(1.5).toString()) // Color más oscuro para contraste
            .attr('font-weight', '500')
            .attr('font-family', 'sans-serif')
            .text(text);
    });

    // Tokenizar las respuestas
    const loveTokens = tokenizeText(responses.love);
    const talentTokens = tokenizeText(responses.talent);
    const needTokens = tokenizeText(responses.need);
    const paymentTokens = tokenizeText(responses.payment);

    // Palabras del usuario dentro de los círculos (list layout)
    const placeWordsList = (words: string[], center: {x: number, y: number}, key: string) => {
      if (words.length === 0) return;
      const fontSize = adjustedDiagramSize * 0.03; // Tamaño mayor y consistente
      const lineHeight = fontSize * 1.3;
      let x0 = center.x;
      let y0 = center.y;
      // Ajustar posición según sección
      switch (key) {
        case 'love':
          y0 = center.y - circleRadius * 0.45;
          break;
        case 'talent':
          x0 = center.x - circleRadius * 0.45;
          y0 = center.y - ((words.length - 1) * lineHeight) / 2;
          break;
        case 'need':
          x0 = center.x + circleRadius * 0.45;
          y0 = center.y - ((words.length - 1) * lineHeight) / 2;
          break;
        case 'payment':
          y0 = center.y + circleRadius * 0.45 - (words.length - 1) * lineHeight;
          break;
      }
      // Renderizar cada palabra
      words.forEach((word, i) => {
        g.append('text')
          .attr('x', x0)
          .attr('y', y0 + i * lineHeight)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', d3.rgb(colors[key as keyof typeof colors]).darker(1.2).toString())
          .attr('font-size', fontSize)
          .attr('font-weight', '500')
          .attr('font-family', 'sans-serif')
          .text(word)
          .style('opacity', 0)
          .transition().duration(400).delay(i * 100).style('opacity', 1);
      });
    };
    placeWordsList(loveTokens, centers.love, 'love');
    placeWordsList(talentTokens, centers.talent, 'talent');
    placeWordsList(needTokens, centers.need, 'need');
    placeWordsList(paymentTokens, centers.payment, 'payment');

    // Key Labels (LOVE, TALENT, etc.) dentro de los círculos
    const keyLabelRadius = adjustedDiagramSize * 0.035;
    const keyLabelFontSize = adjustedDiagramSize * 0.022;
    Object.keys(centers).forEach(key => {
        const c = centers[key as keyof typeof centers];
        let labelX = c.x, labelY = c.y;
        // Ajustar posición para que estén dentro del círculo cerca del borde superior/lateral
        if (key === 'love') labelY = c.y - circleRadius + keyLabelRadius * 1.8;
        if (key === 'talent') labelX = c.x - circleRadius + keyLabelRadius * 1.8;
        if (key === 'need') labelX = c.x + circleRadius - keyLabelRadius * 1.8;
        if (key === 'payment') labelY = c.y + circleRadius - keyLabelRadius * 1.8;

        g.append('circle')
            .attr('cx', labelX).attr('cy', labelY).attr('r', keyLabelRadius)
            .attr('fill', '#f1f5f9') // Light gray background
            .attr('stroke', d3.rgb(colors[key as keyof typeof colors]).darker(0.7).toString())
            .attr('stroke-width', 1);
        g.append('text')
            .attr('x', labelX).attr('y', labelY)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
            .attr('font-size', keyLabelFontSize).attr('fill', d3.rgb(colors[key as keyof typeof colors]).darker(1).toString())
            .attr('font-weight', 'bold').attr('font-family', 'sans-serif')
            .text(key.toUpperCase());
    });

    // Etiquetas de Intersección (PASIÓN, MISIÓN, etc.)
    const addIntersectionLabel = (text: string, x: number, y: number, colorValue: string, angle: number = 0) => {
      const group = g.append('g').attr('transform', `translate(${x},${y}) rotate(${angle})`);
      const padding = { x: adjustedDiagramSize * 0.015, y: adjustedDiagramSize * 0.008 }; // Padding para el fondo
      const textElement = group.append('text')
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', colorValue).attr('font-size', adjustedDiagramSize * 0.028)
        .attr('font-weight', '600').attr('font-family', 'sans-serif').text(text);
      
      const bbox = (textElement.node() as SVGTextElement).getBBox();
      group.insert('rect', 'text') // Insertar el rect detrás del texto
        .attr('x', bbox.x - padding.x)
        .attr('y', bbox.y - padding.y)
        .attr('width', bbox.width + padding.x * 2)
        .attr('height', bbox.height + padding.y * 2)
        .attr('rx', adjustedDiagramSize * 0.01).attr('ry', adjustedDiagramSize * 0.01)
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
    const centerX = adjustedDiagramSize / 2;
    const centerY = adjustedDiagramSize / 2;
    const ikigaiLabelGroup = g.append('g').attr('transform', `translate(${centerX},${centerY})`);
    const ikigaiText = ikigaiLabelGroup.append('text')
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
        .attr('fill', intersectionColors.center).attr('font-size', adjustedDiagramSize * 0.045)
        .attr('font-weight', 'bold').attr('font-family', 'sans-serif').text("IKIGAI");
    const ikigaiBBox = (ikigaiText.node() as SVGTextElement).getBBox();
    ikigaiLabelGroup.insert('circle', 'text')
        .attr('r', Math.max(ikigaiBBox.width, ikigaiBBox.height) * 0.75) // Radio basado en el tamaño del texto
        .attr('fill', 'rgba(255,255,255,0.9)') // Fondo blanco más opaco
        .attr('stroke', d3.rgb(intersectionColors.center).darker(0.5).toString()).attr('stroke-width', 1.5);

    // Palabras de la intersección central (si existen)
    const centerIntersectionTokens = tokenizeText(
        findIntersections(
            findIntersections(loveTokens, talentTokens),
            findIntersections(needTokens, paymentTokens)
        ).join(' ')
    );
    if (centerIntersectionTokens.length > 0) {
        placeWordsList(centerIntersectionTokens, { x: centerX, y: centerY }, 'center');
    }
  });

  return (
    <div ref={containerRef} class="w-full h-full relative">
      <svg 
        ref={ref || diagramRef} 
        class="w-full h-full relative z-10"
      ></svg>
      {/* Estilos CSS para animaciones podrían ir aquí si son necesarios */}
    </div>
  );
});