import type { ThemeMode } from "./types"

export const THEME_MODES: ThemeMode[] = ["dark", "light", "system"]

export const THEME_MODE_MUTATION_OBSERVATION_SCOPE: MutationObserverInit = {
  attributeFilter: ["class"],
}
