import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { makeConfig } from "@lingui/conf"
import rolldownBabel from "@rolldown/plugin-babel"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  //* Both the checkout sources and the built ui-kit output carry `@lingui/core/macro` imports, which
  //* resolve to a `babel-plugin-macros` shim unless Babel rewrites them first. The plugin refuses
  //* to run without a config, so it gets a throwaway one.
  plugins: [
    //* Resolves `.po` imports to empty catalogs: only the Lingui Vite plugin compiles them, and
    //* they are generated. Macros keep their source messages under test.
    {
      name: "empty-lingui-catalogs",
      enforce: "pre",
      resolveId: (source) => (source.endsWith(".po") ? `\0empty-catalog:${source}` : null),

      load: (id) => (id.startsWith("\0empty-catalog:") ? "export const messages = {}" : null),
    },

    rolldownBabel({
      plugins: [
        [
          "@lingui/babel-plugin-lingui-macro",
          { linguiConfig: makeConfig({ locales: [SOURCE_LOCALE_ID] }, { skipValidation: true }) },
        ],
      ],
    }),
  ],

  test: {
    include: ["src/**/*.spec.{ts,tsx}"],
    environment: "jsdom",
    restoreMocks: true,
    setupFiles: "./vitest.setup.ts",
  },
})
