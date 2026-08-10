import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { baseOxlintConfig } from "@bitcart/configs/base/oxlint"
import { reactOxlintConfig } from "@bitcart/configs/by-view-layer/react-oxlint"
import { unocssOxlintConfig } from "@bitcart/configs/supplementary/unocss-oxlint"
import { defineConfig } from "oxlint"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  extends: [baseOxlintConfig, reactOxlintConfig, unocssOxlintConfig],

  rules: {
    "react/only-export-components": ["warn", { allowConstantExport: true }],
  },

  settings: {
    "better-tailwindcss": {
      entryPoint: resolve(__dirname, "src/routes/-layout/uno.generated.css"),
    },
  },

  overrides: [
    {
      files: [
        //* TanStack route modules export a non-component `Route` and define their
        //* component locally; their HMR is handled by the router's Vite plugin.
        "src/routes/**",

        "src/views/**/stories.tsx",
      ],

      rules: {
        "react/only-export-components": "off",
      },
    },

    {
      files: ["src/views/**"],

      rules: {
        //* Stories import example sources with Vite's `?raw` query, which oxlint's import
        //* resolver can't follow (it resolves to the .tsx module and finds no default
        //* export). Typechecking still validates these via vite/client's `*?raw` module.
        "import/default": "off",

        "jsx-a11y/anchor-is-valid": "off",
        "jsx-a11y/control-has-associated-label": "off",
      },
    },
  ],
})
