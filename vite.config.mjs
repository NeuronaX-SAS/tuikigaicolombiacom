import './src/utils/jsonPatch.js';
import { defineConfig, loadEnv } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  
  return {
    plugins: [
      qwikVite({
        srcDir: "./src",
        entryStrategy: { type: "hook" },
        devTools: {
          clickToSource: isDev
        },
        debug: isDev,
        vendorRoots: isDev ? [] : undefined
      }),
      qwikCity() // Remove ssr: false
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
    
//    optimizeDeps: {
//      force: true,
//      include: ['@builder.io/qwik', '@builder.io/qwik/jsx-runtime', 'd3', 'canvas-confetti'],
//     exclude: ['@builder.io/qwik/build']
//    },
    
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
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/d3')) return 'd3';
            if (id.includes('node_modules/canvas-confetti')) return 'confetti';
          }
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