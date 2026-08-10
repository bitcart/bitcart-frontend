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

    "apps/directory": appKnipConfig,

    "apps/landing": {
      ...appKnipConfig,
      entry: [...appKnipConfig.entry, "scripts/**/*.ts"],
      project: [...appKnipConfig.project, "scripts/**/*.ts"],
    },

    "apps/ui-docs": {
      entry: [
        //* Bundled by @fumadocs/story and rendered in MDX docs.
        "src/views/**/stories.{ts,tsx}",

        //* Imported from content/docs MDX files, which Knip does not parse.
        "src/views/**/examples/*.{ts,tsx}",

        "vite.config.ts",
        "lingui.config.ts",
        "env.config.ts",
        "node-env.ts",
      ],

      vite: appKnipConfig.vite,

      ignoreDependencies: [
        ...(appKnipConfig.ignoreDependencies ?? []),

        //* Kept installed for easy opt-in router debugging.
        "@tanstack/react-router-devtools",

        //* TanStack Start's server runtime.
        "srvx",

        //! Never imported from source: Base UI's transitive CJS dep, declared directly
        //! so nitro's server pass can resolve it after the vite SSR pass externalizes
        //! it (see environments.ssr in vite.config.ts).
        "use-sync-external-store",
      ],
    },

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

    "packages/hooks": {
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

    "templates/vike-app": appKnipConfig,
  },
}

export default config
