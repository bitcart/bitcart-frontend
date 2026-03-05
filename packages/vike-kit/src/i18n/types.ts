import type { Messages as LocaleMessages } from "@lingui/core"

export type { LocaleMessages }

export type LocaleModules = Record<string, () => Promise<{ messages: LocaleMessages }>>
