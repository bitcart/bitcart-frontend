import { defineConfig } from "oxlint"

export const unocssOxlintConfig = defineConfig({
  jsPlugins: ["eslint-plugin-better-tailwindcss"],

  rules: {
    "better-tailwindcss/enforce-canonical-classes": "error",
    "better-tailwindcss/enforce-consistent-class-order": "error",

    "better-tailwindcss/enforce-consistent-line-wrapping": [
      "warn",
      { preferSingleLine: true, printWidth: 100 },
    ],

    "better-tailwindcss/no-conflicting-classes": "error",
    "better-tailwindcss/no-deprecated-classes": "error",
    "better-tailwindcss/no-duplicate-classes": "error",
    "better-tailwindcss/no-unknown-classes": "off",
    "better-tailwindcss/no-unnecessary-whitespace": "error",
  },
})
