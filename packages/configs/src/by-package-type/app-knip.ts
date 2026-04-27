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

  ignoreDependencies: [
    "@stylistic/eslint-plugin",
    "eslint-plugin-better-tailwindcss",
    "eslint-plugin-react-hooks",
    "inter-ui",
  ],

  vite: false,
}
