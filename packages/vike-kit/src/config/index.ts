import type { Config } from "vike/types"

export type VikeConfigInputs = Pick<Config, "extends" | "passToClient"> & {
  ssr?: boolean
}

/**
 * https://vike.dev/config
 */
export const createVikeConfig = ({
  //* `extends` is a reserved word in TS
  extends: extendsConfig,
  passToClient = [],
  ssr,
}: VikeConfigInputs): Config =>
  ({
    extends: extendsConfig,
    keepScrollPosition: true,
    passToClient: ["localeId", "posixLocaleId", "messages", "metadata", ...passToClient],
    prerender: { enable: true, parallel: false },
    ssr,
    trailingSlash: false,

    htmlAttributes: {
      prefix: "og: http://ogp.me/ns#",
      suppressHydrationWarning: true,
    },
  }) as Config
