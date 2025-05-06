import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { resolve } from 'path';

/**
 * Cloudflare-specific build configuration
 * This helps resolve permission issues in the Cloudflare Pages build environment
 */
export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
      '@qwik-city-plan': resolve(__dirname, 'tmp/qwik-city-plan.mjs'),
    },
  },
  plugins: [
    qwikCity(),
    qwikVite({
      client: {
        outDir: 'dist',
      },
      ssr: {
        outDir: 'dist/server',
      },
    }),
  ],
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: false, // Important: Don't attempt to empty the output directory to avoid permission issues
    assetsDir: 'build',
    ssr: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      external: ['@qwik-city-plan'],
    },
  },
  ssr: {
    noExternal: true,
  },
}); 