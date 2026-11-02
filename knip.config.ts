import {
  APP_CONFIG_FILE_ENTRIES,
  appKnipConfig,
  vikeAppKnipConfig,
} from "@bitcart/configs/by-package-type/app-knip"
import type { KnipConfig } from "knip"

//* Referenced only from `GEIST_MONO_PREFLIGHT`'s CSS, which Knip does not read.
const GEIST_MONO = "@fontsource-variable/geist-mono"

const TANSTACK_START_SERVER_DEPENDENCIES = [
  //* TanStack Start's server runtime.
  "srvx",

  //* Base UI's transitive CJS dep. Declared directly and never imported to let nitro
  //* resolve it after environments.ssr in vite.config.ts externalizes it.
  "use-sync-external-store",
]

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
      ignoreDependencies: ["@playwright/test", "tailwindcss"],
    },

    "apps/blog": {
      ...appKnipConfig,
      entry: [...appKnipConfig.entry, "scripts/**/*.ts"],
      project: [...appKnipConfig.project, "scripts/**/*.ts", "content/**/*.mdx"],

      ignoreDependencies: [
        ...(appKnipConfig.ignoreDependencies ?? []),
        GEIST_MONO,
        ...TANSTACK_START_SERVER_DEPENDENCIES,
      ],
    },

    "apps/checkout": {
      ...appKnipConfig,
      entry: [...appKnipConfig.entry, "src/embed/v1.ts", "src/embed/modal.ts"],
      ignoreDependencies: [...(appKnipConfig.ignoreDependencies ?? []), GEIST_MONO],
    },

    "apps/directory": vikeAppKnipConfig,

    "apps/landing": {
      ...vikeAppKnipConfig,
      entry: [...vikeAppKnipConfig.entry, "scripts/**/*.ts"],
      project: [...vikeAppKnipConfig.project, "scripts/**/*.ts"],
    },

    "apps/ui-docs": {
      ...appKnipConfig,

      entry: [
        //* Bundled by @fumadocs/story and rendered in MDX docs.
        "src/views/**/stories.{ts,tsx}",

        //* Imported from content/docs MDX files, which Knip does not parse.
        "src/views/**/examples/*.{ts,tsx}",

        ...APP_CONFIG_FILE_ENTRIES,
      ],

      project: ["src/**/*.{ts,tsx,css}", "content/**/*.mdx"],

      ignoreDependencies: [
        ...(appKnipConfig.ignoreDependencies ?? []),
        GEIST_MONO,

        //* Kept installed for easy opt-in router debugging.
        "@tanstack/react-router-devtools",

        ...TANSTACK_START_SERVER_DEPENDENCIES,
      ],
    },

    "packages/client-sdk": {
      ignore: [
        // TODO: Remove once each endpoint gets at least one exported wrapper.
        "src/endpoints/_internal/generated/**",

        "scripts/**/*.ts",
      ],
    },

    "packages/configs": {
      entry: ["src/**/*.ts"],
      project: ["src/**/*.ts"],
    },

    //* Read by the Lingui CLI and the package's tsdown config.
    "packages/form-kit": { entry: ["lingui.config.ts"] },
    "packages/ui-kit": {
      entry: ["lingui.config.ts", "scripts/**/*.ts"],
      project: ["src/**/*.{ts,tsx}", "scripts/**/*.ts"],
    },

    "templates/vike-app": vikeAppKnipConfig,
  },
}

export default config
