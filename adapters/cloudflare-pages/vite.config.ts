import { cloudflarePagesAdapter } from "@builder.io/qwik-city/adapters/cloudflare-pages/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config.mjs";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.cloudflare-pages.tsx", "@qwik-city-plan"],
      },
      outDir: "dist", // Output to the main dist directory
      emptyOutDir: false, // preserve existing dist content from client build
    },
    plugins: [
      cloudflarePagesAdapter({
        // We can try adding options here again if needed, but start simple
      })
    ],
  };
});
