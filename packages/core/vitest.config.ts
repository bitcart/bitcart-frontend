import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  test: {
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: "./vitest.setup.ts",
  },
})
