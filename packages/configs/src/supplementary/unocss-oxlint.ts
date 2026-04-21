import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "oxlint"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const unocssOxlintConfig = defineConfig({
  jsPlugins: ["eslint-plugin-better-tailwindcss", resolve(__dirname, "./classname-hygiene.ts")],

  rules: {
    "classname-hygiene/no-template-literal-classname": "error",

    // This rule is not properly compatible with unocss so disabling for now
    "better-tailwindcss/enforce-canonical-classes": "off",
    "better-tailwindcss/enforce-consistent-class-order": "error",

    "better-tailwindcss/enforce-consistent-line-wrapping": [
      "warn",
      { preferSingleLine: true, printWidth: 100, strictness: "loose" },
    ],

    "better-tailwindcss/no-conflicting-classes": "error",
    "better-tailwindcss/no-deprecated-classes": "error",
    "better-tailwindcss/no-duplicate-classes": "error",
    "better-tailwindcss/no-unknown-classes": "off",
    "better-tailwindcss/no-unnecessary-whitespace": "error",
  },
})
