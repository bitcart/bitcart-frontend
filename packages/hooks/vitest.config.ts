import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  //* Compiled as the apps compile this package.
  plugins: [react({ compiler: true })],

  test: {
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: "./vitest.setup.ts",
  },
})
