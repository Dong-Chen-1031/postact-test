/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  // ---- Library mode (optional) ----
  // Uncomment if you want Vite to build the lib for preview
  // build: {
  //   lib: {
  //     entry: 'src/index.ts',
  //     formats: ['es', 'cjs'],
  //     fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
  //   },
  //   rollupOptions: { external: [] },
  // },

  // ---- Test environment ----
  test: {
    globals: true, // `describe`, `it`, `expect` without imports
    environment: "jsdom", // DOM APIs (document, window)
    setupFiles: "./tests/setup.ts", // optional global setup
    coverage: { provider: "v8" },
  },
});
