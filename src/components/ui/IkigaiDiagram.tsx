import { component$, useVisibleTask$, useSignal, useTask$ } from '@builder.io/qwik';
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
  const previousResponses = useSignal<typeof responses>({ love: '', talent: '', need: '', payment: '' });
  
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

  // Función para verificar si las respuestas han cambiado
  useTask$(({ track }) => {
    track(() => responses);
    // Si hay cambios significativos, actualizar el estado previo
    if (
      responses.love !== previousResponses.value.love ||
      responses.talent !== previousResponses.value.talent ||
      responses.need !== previousResponses.value.need ||
      responses.payment !== previousResponses.value.payment
    ) {
      previousResponses.value = { ...responses };
      renderDiagram();
    }
  });

  // Función para renderizar el diagrama
  const renderDiagram = () => {
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
    const logoY = size - frameWidth - footerHeight/2;
    
    // Añadir fondo para el texto del footer
    svg.append('rect')
      .attr('x', frameWidth + (size - frameWidth * 2) * 0.25)
      .attr('y', logoY - footerHeight * 0.25)
      .attr('width', (size - frameWidth * 2) * 0.5)
      .attr('height', footerHeight * 0.5)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(47, 79, 79, 0.7)')
      .attr('filter', 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))');
    
    // Texto "TUIKIGAI" y frase (corregido sin espacio)
    svg.append('text')
      .attr('x', footerTextX)
      .attr('y', logoY - 5)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'white')
      .attr('font-size', footerHeight * 0.35)
      .attr('font-weight', 'bold')
      .attr('font-family', 'sans-serif')
      .text("TUIKIGAI");
      
    svg.append('text')
      .attr('x', footerTextX)
      .attr('y', logoY + footerHeight * 0.2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', 'rgba(255,255,255,0.8)')
      .attr('font-size', footerHeight * 0.22)
      .attr('font-style', 'italic')
      .attr('font-family', 'sans-serif')
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

    // Nueva función para renderizar respuestas con un mejor diseño
    const displayUserResponses = (items: string[], center: {x: number, y: number}, key: string) => {
      if (items.length === 0) return;
      
      // Etiquetas de círculos para colocar en los contenedores de texto
      const circleLabels = {
        love: "Amas",
        talent: "Tienes",
        need: "Ofreces",
        payment: "Ganas"
      };
      
      // Configuración general para todas las áreas
      const fontSize = finalDiagramSize * 0.03; // Fuente ligeramente más grande
      const titleFontSize = fontSize * 1.2; // Título más grande
      const lineHeight = fontSize * 1.4;
      
      // Calcular posición óptima según el área para centrar mejor
      let posX = center.x;
      let posY = center.y;
      
      // Ajustes específicos para cada círculo
      switch(key) {
        case 'love': // Círculo superior (Amas)
          posY = center.y; // Centrado
          break;
        case 'talent': // Círculo izquierdo (Tienes)
          posX = center.x; // Centrado
          break;
        case 'need': // Círculo derecho (Ofreces)
          posX = center.x; // Centrado
          break;
        case 'payment': // Círculo inferior (Ganas)
          posY = center.y; // Centrado
          break;
      }

      // Crear un contenedor que mantendrá el texto centrado
      const textContainer = g.append('g')
        .attr('transform', `translate(${posX}, ${posY})`);
      
      // Calcular dimensiones para el marco basado en el contenido
      const maxLength = items.reduce((max, item) => Math.max(max, item.length), 0);
      // Estimar ancho basado en longitud de texto y tamaño de fuente
      const estimatedWidth = Math.min(
        circleRadius * 1.6, // Hasta un 80% del diámetro
        Math.max(maxLength * fontSize * 0.6, circleRadius * 0.7)
      );
      
      // Altura basada en número de elementos y el título
      const containerHeight = (items.length * lineHeight) + titleFontSize * 2 + 24; // Incluir espacio para título
      
      // Crear fondo redondeado con mejor estilo visual
      textContainer.append('rect')
        .attr('x', -estimatedWidth/2)
        .attr('y', -containerHeight/2)
        .attr('width', estimatedWidth)
        .attr('height', containerHeight)
        .attr('rx', 16)
        .attr('ry', 16)
        .attr('fill', 'rgba(255,255,255,0.95)')
        .attr('stroke', d3.rgb(colors[key as keyof typeof colors]).darker(0.4).toString())
        .attr('stroke-width', 2)
        .attr('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))');
      
      // Agregar título (Amas, Tienes, etc.) en la parte superior del contenedor
      textContainer.append('text')
        .attr('x', 0)
        .attr('y', -containerHeight/2 + titleFontSize + 4) // Posición en la parte superior
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', d3.rgb(colors[key as keyof typeof colors]).darker(1.7).toString())
        .attr('font-size', titleFontSize)
        .attr('font-weight', 'bold')
        .attr('font-family', 'sans-serif')
        .text(circleLabels[key as keyof typeof circleLabels]);
        
      // Agregar línea separadora debajo del título
      textContainer.append('line')
        .attr('x1', -estimatedWidth/2 + 12)
        .attr('x2', estimatedWidth/2 - 12)
        .attr('y1', -containerHeight/2 + titleFontSize * 2)
        .attr('y2', -containerHeight/2 + titleFontSize * 2)
        .attr('stroke', d3.rgb(colors[key as keyof typeof colors]).darker(0.3).toString())
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
      
      // Calcular posición vertical inicial para los elementos
      const contentStartY = -containerHeight/2 + titleFontSize * 2.5; // Comenzar después del título
      
      // Renderizar cada elemento con mejor estilo
      items.forEach((item, i) => {
        // Controlar longitud máxima
        let displayText = item;
        if (item.length > 30) {
          displayText = item.substring(0, 27) + '...';
        }
        
        textContainer.append('text')
          .attr('x', 0)
          .attr('y', contentStartY + i * lineHeight)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', d3.rgb(colors[key as keyof typeof colors]).darker(1.5).toString())
          .attr('font-size', fontSize)
          .attr('font-weight', '500')
          .attr('font-family', 'sans-serif')
          .attr('letter-spacing', '0.2px')
          .text(displayText)
          .style('opacity', 0)
          .transition().duration(250).delay(i * 80).style('opacity', 1);
      });
    };
    
    // Renderizar respuestas en sus respectivas áreas
    displayUserResponses(loveResponses, centers.love, 'love');
    displayUserResponses(talentResponses, centers.talent, 'talent');
    displayUserResponses(needResponses, centers.need, 'need');
    displayUserResponses(paymentResponses, centers.payment, 'payment');

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
  };

  // Renderizar el diagrama cuando cambian las respuestas o el tamaño
  useVisibleTask$(({ track }) => {
    track(() => responses);
    track(() => convergenceIndex);
    track(() => userName); // Seguir cambios en userName
    
    renderDiagram();
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