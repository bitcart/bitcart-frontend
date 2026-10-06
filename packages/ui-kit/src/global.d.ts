declare module "*.po" {
  import type { Messages } from "@lingui/core"

  export const messages: Messages
}

interface ImportMeta {
  //* Compiled by tsdown's `globImport`, which follows Vite's `import.meta.glob`.
  glob: <TModule>(patterns: string | readonly string[]) => Record<string, () => Promise<TModule>>
}
