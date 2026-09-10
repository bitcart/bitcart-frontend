import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { makeConfig } from "@lingui/conf"
import rolldownBabel from "@rolldown/plugin-babel"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  //* The ui-kit components this package wraps ship built output that carries `@lingui/core/macro`
  //* imports, which resolve to a `babel-plugin-macros` shim unless Babel rewrites them first. The
  //* plugin refuses to run without a config, so it gets a throwaway one.
  plugins: [
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
    environment: "jsdom",
    restoreMocks: true,
  },
})
