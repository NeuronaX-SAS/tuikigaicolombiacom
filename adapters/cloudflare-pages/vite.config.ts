import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { cloudflarePagesAdapter } from "@builder.io/qwik-city/adapters/cloudflare-pages/vite";

export default defineConfig(() => {
  return {
    // We only need plugins and build options relevant to the server build
    plugins: [
      qwikVite({ ssr: { outDir: '../../dist' } }), // Minimal Qwik Vite config for SSR, adjust outDir
      qwikCity(), // Needed for virtual modules
      cloudflarePagesAdapter(), // Let adapter handle defaults
    ],
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.cloudflare-pages.tsx", "@qwik-city-plan"],
      },
      outDir: '../../dist', // Output relative to this config file's location
    },
    // Remove base config inheritance to avoid potential conflicts
  };
});
