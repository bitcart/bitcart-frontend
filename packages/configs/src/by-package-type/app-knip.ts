import type { WorkspaceProjectConfig } from "knip"

type AppKnipConfig = Omit<WorkspaceProjectConfig, "entry" | "project"> & {
  entry: string[]
  project: string[]
}

export const appKnipConfig: AppKnipConfig = {
  entry: [
    "src/pages/**/+*.{ts,tsx}",
    "vite.config.ts",
    "lingui.config.ts",
    "env.config.ts",
    "node-env.ts",
    "constants.ts",
    "e2e/**/*.spec.ts",
  ],

  project: ["src/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],

  ignoreDependencies: ["inter-ui"],

  //! Knip loads Vite configs from the workspace root, where `lingui()` finds no Lingui config and
  //! Vike crawls every app as one. Listing `vite.config.ts` as an entry tracks its imports instead.
  vite: false,
}
