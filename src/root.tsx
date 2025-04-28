import { component$, useStyles$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet, ServiceWorkerRegister } from '@builder.io/qwik-city';
import { RouterHead } from './components/router-head/router-head'; // Assuming you have this or similar for meta tags

import styles from './styles/main.css?inline'; // Import styles to be injected

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */
  useStyles$(styles); // Use the imported styles

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        {/*
          RouterHead component will manage title, meta tags etc.
          Qwik should automatically inject the CSS <link> tag here based on useStyles$
        */}
        <RouterHead />
        <ServiceWorkerRegister />
      </head>
      <body lang="es" class="bg-tuikigai-cream text-tuikigai-navy font-sans">
        {/* RouterOutlet is where the page content will be rendered */}
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});