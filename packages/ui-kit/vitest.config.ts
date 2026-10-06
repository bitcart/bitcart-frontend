import { linguiMacrosPlugin } from "@bitcart/configs/supplementary/lingui-macros"
import { getConfig } from "@lingui/conf"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  //* Compiled as the apps compile this package. Lingui macros must expand first: React Compiler also
  //* runs in Vite's "pre" stage and would otherwise hoist JSX out of `<Trans>`.
  plugins: [
    { ...linguiMacrosPlugin(getConfig({ cwd: import.meta.dirname })), enforce: "pre" },
    react({ compiler: true }),
  ],

  test: {
    environment: "jsdom",
  },
})
