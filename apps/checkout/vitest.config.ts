import { lingui } from "@lingui/vite-plugin"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  //* Compiles Lingui macros and React Compiler as the app does, macros first. Vitest runs from the
  //* workspace root, so the Lingui config is looked up from here.
  plugins: [
    //* Resolves `.po` imports to empty catalogs: they are generated and gitignored, so tests can't
    //* rely on them existing. Macros keep their source messages under test.
    {
      name: "empty-lingui-catalogs",
      enforce: "pre",

      //! The id must not end in `.po`, or the Lingui plugin below tries to compile it from disk.
      resolveId: (source) =>
        source.endsWith(".po") ? `\0empty-catalog:${source.slice(0, -".po".length)}` : null,

      load: (id) => (id.startsWith("\0empty-catalog:") ? "export const messages = {}" : null),
    },

    lingui({ cwd: import.meta.dirname, macroTransform: true }),
    viteReact({ compiler: true }),
  ],

  test: {
    include: ["src/**/*.spec.{ts,tsx}"],
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: "./vitest.setup.ts",
  },
})
