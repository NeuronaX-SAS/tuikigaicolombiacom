import './src/utils/jsonPatch.js';
import { defineConfig, loadEnv } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { cloudflarePagesAdapter } from "@builder.io/qwik-city/adapters/cloudflare-pages/vite"; // Add adapter import
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  return {
    base: '/',
    plugins: [
      qwikVite(), // Simplify qwikVite options, let it use defaults
      qwikCity(),
      cloudflarePagesAdapter() // Add adapter plugin
    ],

    server: {
      port: 3000,
      open: true,
      cors: true,
      hmr: {
        overlay: false,
      },
      middlewareMode: false
    },
    
    resolve: {
      alias: {
        '@utils': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/utils'),
      },
    },

    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        }
      },
      rollupOptions: {
        // Explicitly define SSR inputs as suggested by the error message
        input: ["src/entry.ssr.tsx", "@qwik-city-plan"],
      },
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000
    },
    
    esbuild: {
      supported: {
        'top-level-await': true,
        'dynamic-import': true
      }
    }
  };
});