# TUIKIGAI - Descubre tu propósito

TUIKIGAI es una aplicación web interactiva que ayuda a los usuarios a descubrir su propósito de vida a través del concepto japonés del Ikigai. La plataforma permite a los usuarios responder a cuatro preguntas clave y visualizar la relación entre sus respuestas mediante un diagrama interactivo que evoluciona en tiempo real.

## Características principales

- **Ikigai Playground**: Permite a los usuarios responder las cuatro preguntas fundamentales del Ikigai:
  - Lo que amas
  - En lo que eres bueno
  - Lo que el mundo necesita
  - Por lo que te pagarían

- **Diagrama interactivo en tiempo real**: Visualización en D3.js que muestra la relación entre las respuestas.

- **Índice de Convergencia**: Medidor que muestra el porcentaje de coincidencias cruzadas entre las respuestas.

- **Flujos comerciales**:
  - Canjear código de regalo (sin pago)
  - Regalar experiencia (109.000 COP)
  - Comprar para sí mismo (99.000 COP)

- **Integración con Siigo Checkout**: Para procesar pagos y generar facturas electrónicas DIAN.

## Tecnologías utilizadas

- **Frontend**: Qwik, TailwindCSS, D3.js, Framer Motion
- **Backend**: Google Apps Script (GAS)
- **Base de datos**: Google Sheets
- **Facturación**: Siigo Checkout
- **Alojamiento**: Cloudflare Pages
- **Seguridad**: Cloudflare Turnstile
- **Análisis**: Cloudflare Web Analytics

## Estructura del proyecto

```
/
├── src/                       # Código fuente
│   ├── components/            # Componentes de la aplicación
│   │   ├── sections/          # Secciones principales
│   │   └── ui/               # Componentes de UI reutilizables
│   ├── styles/                # Estilos CSS
│   └── main.jsx               # Punto de entrada
├── backend/                   # Script de backend para Google Apps Script
├── public/                    # Archivos estáticos
└── index.html                 # Plantilla HTML principal
```

## Requisitos previos

- Node.js 16.x o superior
- Cuenta de Cloudflare (para el despliegue)
- Cuenta de Google (para el backend con Apps Script y Sheets)
- Cuenta de Siigo (para facturación electrónica)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/username/tuikigai.git
   cd tuikigai
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` con las siguientes variables:
   ```
   VITE_BACKEND_URL=https://script.google.com/macros/s/tu-script-id/exec
   VITE_TURNSTILE_SITEKEY=tu-sitekey-de-cloudflare-turnstile
   ```

## Ejecución en desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Configuración del backend

### Google Sheets

1. Crea una nueva hoja de cálculo de Google Sheets.
2. Crea tres hojas con los siguientes nombres:
   - `Submissions` (para registrar todas las entradas)
   - `GiftCodes` (para gestionar códigos de regalo)
   - `Transactions` (para seguimiento de transacciones)

### Google Apps Script

1. En la hoja de cálculo, ve a Extensiones > Apps Script.
2. Copia y pega el contenido del archivo `backend/tuikigai-backend.js`.
3. Actualiza las constantes `SPREADSHEET_ID` y `SIIGO_API` con tus credenciales.
4. Despliega el script como aplicación web:
   - Implementar > Nueva implementación.
   - Selecciona "Aplicación web".
   - Ejecutar como: "Yo" (tu cuenta).
   - Quién tiene acceso: "Cualquier persona".
   - Haz clic en "Implementar".
   - Copia la URL de la aplicación web y actualiza `VITE_BACKEND_URL` en tu archivo `.env`.

### Siigo Checkout

1. Regístrate en [Siigo](https://siigo.com).
2. Crea los productos para la experiencia personal y de regalo.
3. Obtén tus credenciales de API y configura las URLs de redirección.
4. Actualiza las constantes `SIIGO_API` y `SIIGO_PRODUCT_IDS` en el script de backend.

## Despliegue en Cloudflare Pages

1. Prepara la aplicación para producción:
   ```bash
   npm run build
   ```

2. Conecta tu repositorio a Cloudflare Pages:
   - Inicia sesión en [Cloudflare Pages](https://pages.cloudflare.com/).
   - Haz clic en "Crear un proyecto".
   - Conecta tu repositorio de GitHub.
   - Configura el proyecto con los siguientes ajustes:
     - Comando de compilación: `npm run build`
     - Directorio de salida: `dist`
     - Variables de entorno: Añade las mismas variables que en tu archivo `.env`.

3. Configura un dominio personalizado si lo deseas.

## Configuración de Cloudflare Turnstile

1. Crea una clave de sitio en [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/).
2. Actualiza `VITE_TURNSTILE_SITEKEY` en tu archivo `.env` con la clave obtenida.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir los cambios propuestos.

## Licencia

[MIT](LICENSE)

## Autor

NeuronaX S.A.S.

## Contacto

Para soporte o consultas: hola@tuikigai.co

## Cloudflare Pages

Cloudflare's [wrangler](https://github.com/cloudflare/wrangler) CLI can be used to preview a production build locally. To start a local server, run:

```
npm run serve
```

Then visit [http://localhost:8787/](http://localhost:8787/)

### Deployments

[Cloudflare Pages](https://pages.cloudflare.com/) are deployable through their [Git provider integrations](https://developers.cloudflare.com/pages/platform/git-integration/).

If you don't already have an account, then [create a Cloudflare account here](https://dash.cloudflare.com/sign-up/pages). Next go to your dashboard and follow the [Cloudflare Pages deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

Within the projects "Settings" for "Build and deployments", the "Build command" should be `npm run build`, and the "Build output directory" should be set to `dist`.

### Function Invocation Routes

Cloudflare Page's [function-invocation-routes config](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes) can be used to include, or exclude, certain paths to be used by the worker functions. Having a `_routes.json` file gives developers more granular control over when your Function is invoked.
This is useful to determine if a page response should be Server-Side Rendered (SSR) or if the response should use a static-site generated (SSG) `index.html` file.

By default, the Cloudflare pages adaptor _does not_ include a `public/_routes.json` config, but rather it is auto-generated from the build by the Cloudflare adaptor. An example of an auto-generate `dist/_routes.json` would be:

```
{
  "include": [
    "/*"
  ],
  "exclude": [
    "/_headers",
    "/_redirects",
    "/build/*",
    "/favicon.ico",
    "/manifest.json",
    "/service-worker.js",
    "/about"
  ],
  "version": 1
}
```

In the above example, it's saying _all_ pages should be SSR'd. However, the root static files such as `/favicon.ico` and any static assets in `/build/*` should be excluded from the Functions, and instead treated as a static file.

In most cases the generated `dist/_routes.json` file is ideal. However, if you need more granular control over each path, you can instead provide you're own `public/_routes.json` file. When the project provides its own `public/_routes.json` file, then the Cloudflare adaptor will not auto-generate the routes config and instead use the committed one within the `public` directory.

## ⚠️ Google Sheets Integration (Mocked)

> **Important:**
>
> The current Google Sheets integration is a mock implementation. No real data is sent to or stored in Google Sheets in production. All related functions (such as saving Ikigai responses, promo codes, or purchases) only log the data and return success, but do not persist anything.
>
> This approach is safe for production and prevents accidental data loss or exposure. If you want to enable real Google Sheets integration in the future, you must:
>
> 1. Replace `utils/googleSheetUtils.js` with a real implementation that uses the Google Sheets API and your credentials.
> 2. Ensure your credentials are stored securely (never hardcoded or committed to the repository).
> 3. Test thoroughly before enabling in production.
