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
      // Add the adapter only during production builds
      !isDev && cloudflarePagesAdapter({
        // Explicitly set the server output directory relative to dist
        serverOutDir: './server' 
      })
    ].filter(Boolean), // Filter out falsy values like the adapter in dev mode

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
      // assetsDir: 'assets', // Let adapter control asset paths
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        }
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