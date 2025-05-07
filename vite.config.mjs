import './src/utils/jsonPatch.js';
import { defineConfig, loadEnv } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { cloudflarePagesAdapter } from '@builder.io/qwik-city/adapters/cloudflare-pages/vite';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  return {
    base: '/',
    plugins: [
      qwikCity(),
      qwikVite(),
      (mode === 'production') && cloudflarePagesAdapter({
      }),
    ].filter(Boolean), 

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
        '~': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
      },
    },

    ssr: (mode === 'production') ? {
      input: 'src/entry.cloudflare-pages.tsx',
      noExternal: true,
    } : {
    },

    build: {
      target: 'es2020',
      outDir: 'dist',
      cssCodeSplit: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        }
      },
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
      }
    },
    
    esbuild: {
      supported: {
        'top-level-await': true,
        'dynamic-import': true
      }
    }
  };
});