import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title || 'TUIKIGAI - Descubre tu propósito'}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {/* <link rel="manifest" href="/manifest.json" /> Qwik City/useDocumentHead handles this if defined */}
      <link rel="icon" type="image/png" href="/favicon.png" />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props}>
          {s.style}
        </style>
      ))}

      {/* Add any other global head elements here */}
      <script src="https://sdk.mercadopago.com/js/v2" async></script>
      {/* Consider moving the large inline script from the original HTML source here if needed globally */}
    </>
  );
});