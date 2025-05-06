import { defineConfig } from 'vite';

/**
 * Cloudflare-specific build configuration
 * This helps resolve permission issues in the Cloudflare Pages build environment
 */
export default defineConfig({
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
  },
  ssr: {
    noExternal: true,
  },
}); 