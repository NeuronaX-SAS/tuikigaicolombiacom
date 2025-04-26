import { component$ } from '@builder.io/qwik';
import UnifiedIkigai from '../components/sections/UnifiedIkigai';
import type { DocumentHead } from '@builder.io/qwik-city';

/**
 * Componente para la ruta raíz ('/') de la aplicación.
 * Muestra el contenido principal de TUIKIGAI.
 */
export default component$(() => {
  return <UnifiedIkigai />;
});

/**
 * Configuración del <head> para la página principal.
 * Define el título y metadatos importantes para SEO.
 */
export const head: DocumentHead = {
  title: 'TUIKIGAI - Descubre tu propósito con metodología premium',
  meta: [
    {
      name: 'description',
      content: 'TUIKIGAI - Descubre tu propósito de vida y maximiza tu potencial a través de la metodología Ikigai. Servicio premium personalizado.',
    },
    {
      name: 'keywords',
      content: 'Ikigai, propósito de vida, desarrollo personal, coaching, bienestar, éxito profesional',
    },
    {
      property: 'og:title',
      content: 'TUIKIGAI - Tu camino hacia el propósito',
    },
    {
      property: 'og:description',
      content: 'Descubre tu propósito de vida con nuestra metodología Ikigai exclusiva. Encuentra el equilibrio entre pasión, talento, valor y remuneración.',
    },
    // Añade otras metaetiquetas relevantes si es necesario (og:image, og:url, twitter:card, etc.)
  ],
};