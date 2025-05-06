import { cloudflarePagesAdapter } from "@builder.io/qwik-city/adapters/cloudflare-pages/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config.mjs";
import { resolve } from "path";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.cloudflare-pages.tsx", "@qwik-city-plan"],
      },
      outDir: resolve(__dirname, "../../dist"),
      emptyOutDir: false, // Don't empty the output directory to avoid permission issues
    },
    plugins: [
      cloudflarePagesAdapter({
        ssg: {
          include: ["/*"],
          origin: "https://tuikigaicolombia.com",
        }
      })
    ],
  };
});
