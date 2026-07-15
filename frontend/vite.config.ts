import { defineConfig } from "vite";
import { resolve } from "node:path";

// Build a single ESM panel.js into the integration's frontend_dist/.
// ZXing is a dynamic import → emitted as a separate lazy chunk.
export default defineConfig({
  build: {
    outDir: resolve(__dirname, "../custom_components/spizarnia/frontend_dist"),
    emptyOutDir: true,
    target: "es2021",
    lib: {
      entry: resolve(__dirname, "src/panel.ts"),
      formats: ["es"],
      fileName: () => "panel.js",
    },
    rollupOptions: {
      output: {
        entryFileNames: "panel.js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name][extname]",
        manualChunks(id) {
          if (id.includes("@zxing")) return "zxing";
        },
      },
    },
    minify: "esbuild",
    sourcemap: false,
  },
});
