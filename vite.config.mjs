import './src/utils/jsonPatch.js';
import { defineConfig, loadEnv } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { cloudflarePagesAdapter } from "@builder.io/qwik-city/adapters/cloudflare-pages/vite";
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';

  return {
    base: '/',
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
      qwikCity(),
      cloudflarePagesAdapter() // Adapter handles its own logic
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
        // Input is handled by the adapter/qwikCity plugin
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules/d3')) return 'd3';
            if (id.includes('node_modules/canvas-confetti')) return 'confetti';
          },
          assetFileNames: 'assets/[name].[hash].[ext]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js'
        }
      },
      // ssr handled by adapter/qwikCity plugin
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