import { appKnipConfig } from "@bitcart/configs/by-package-type/app-knip"
import type { KnipConfig } from "knip"

const config: KnipConfig = {
  //* dependency-cruiser resolves a `.ts` config, but Knip's plugin only looks for the `.js`,
  //* `.cjs`, `.mjs` and `.json` forms.
  "dependency-cruiser": { config: [".dependency-cruiser.ts"] },

  ignoreBinaries: ["dot"],
  ignoreDependencies: ["remeda"],

  ignoreIssues: {
    "**/*.{ts,tsx}": ["exports", "types"],

    // TODO: Remove before Checkout's release!
    "pnpm-workspace.yaml": ["catalog", "catalogReferences"],
  },

  // TODO: Remove before Checkout's release!
  ignoreWorkspaces: ["apps/checkout"],

  workspaces: {
    ".": {
      tailwind: false,
      entry: ["scripts/**/*.ts"],
      project: ["scripts/**/*.ts"],
      ignoreDependencies: ["@playwright/test", "@stylistic/eslint-plugin", "tailwindcss"],
    },

    "apps/checkout": appKnipConfig,
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

        //* Base UI's transitive CJS dep. Declared directly and never imported to let nitro
        //* resolve it after environments.ssr in vite.config.ts externalizes it.
        "use-sync-external-store",
      ],
    },

    "packages/api-sdk": {
      //* Orval's `transformer` option and the Nx target's `tsx` call both name them
      //* as string paths, which Knip cannot follow.
      entry: ["scripts/{postprocess,transform-spec}.ts"],

      // TODO: Remove once each endpoint gets at least one exported wrapper.
      ignore: ["src/endpoints/_internal/generated/**"],

      ignoreDependencies: ["@stylistic/eslint-plugin"],
    },

    "packages/configs": {
      entry: ["src/**/*.ts"],
      project: ["src/**/*.ts"],
    },

    "packages/core": {
      ignoreDependencies: ["@stylistic/eslint-plugin"],
    },

    "packages/form-kit": {
      ignoreDependencies: [
        "@lingui/babel-plugin-lingui-macro",
        "@stylistic/eslint-plugin",
        "eslint-plugin-react-hooks",
      ],
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
