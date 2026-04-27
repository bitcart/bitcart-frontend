import { appKnipConfig } from "@bitcart/configs/by-package-type/app-knip"
import type { KnipConfig } from "knip"

const config: KnipConfig = {
  ignoreBinaries: ["dot"],
  ignoreDependencies: ["@bitcart/core", "remeda"],

  ignoreIssues: {
    "**/*.{ts,tsx}": ["exports", "types"],
  },

  workspaces: {
    ".": {
      entry: ["scripts/**/*.{js,ts}"],
      project: ["scripts/**/*.{js,ts}"],
      ignoreDependencies: ["@playwright/test", "@stylistic/eslint-plugin", "tailwindcss"],
    },

    "apps/landing": {
      ...appKnipConfig,
      entry: [...appKnipConfig.entry, "scripts/**/*.ts"],
      project: [...appKnipConfig.project, "scripts/**/*.ts"],
    },

    "apps/directory": appKnipConfig,

    "packages/configs": {
      entry: ["src/**/*.{js,ts}"],
      project: ["src/**/*.{js,ts}"],
    },

    "packages/core": {
      ignoreDependencies: ["@stylistic/eslint-plugin"],
    },

    "packages/form-kit": {
      ignoreDependencies: ["@stylistic/eslint-plugin", "eslint-plugin-react-hooks"],
    },

    "packages/qa": {
      ignoreDependencies: ["@stylistic/eslint-plugin"],
    },

    "packages/ui-kit": {
      ignoreDependencies: [
        "@stylistic/eslint-plugin",
        "eslint-plugin-better-tailwindcss",
        "eslint-plugin-react-hooks",
      ],
    },

    "packages/unocss-preset": {
      ignoreDependencies: ["@stylistic/eslint-plugin"],
    },

    "packages/vike-kit": {
      ignoreDependencies: ["@stylistic/eslint-plugin", "eslint-plugin-react-hooks"],
    },
  },
}

export default config
