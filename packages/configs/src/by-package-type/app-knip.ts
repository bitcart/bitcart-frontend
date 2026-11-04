import type { WorkspaceProjectConfig } from "knip"

type AppKnipConfig = Omit<WorkspaceProjectConfig, "entry" | "project"> & {
  entry: string[]
  project: string[]
}

export const APP_CONFIG_FILE_ENTRIES: string[] = [
  "vite.config.ts",
  "lingui.config.ts",
  "env.config.ts",
  "node-env.ts",
]

export const appKnipConfig: AppKnipConfig = {
  entry: [...APP_CONFIG_FILE_ENTRIES, "e2e/**/*.spec.ts"],

  project: ["src/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],

  //* Knip loads Vite configs from the workspace root, where `lingui()` finds no Lingui config and
  //* Vike crawls every app as one. Listing `vite.config.ts` as an entry tracks its imports instead.
  vite: false,
}

export const vikeAppKnipConfig: AppKnipConfig = {
  ...appKnipConfig,

  //* Vike preloads the font from the stylesheet, which Knip does not read. TanStack Start apps
  //* import it themselves for their preload link.
  ignoreDependencies: ["@fontsource-variable/inter"],

  entry: [
    //* Knip does not discover Vike routes automatically.
    "src/pages/**/+*.{ts,tsx}",

    ...appKnipConfig.entry,
  ],
}
