import type { ClientRoute } from "@bitcart/core/types"

import { DEFAULT_THEME_KEY } from "@/common/constants"

/**
 * Executed as the first element of <body>, before first paint: applies the stored
 * brand's `theme-<brand>` class. uno.generated.css carries both brands' CSS variables,
 * each scoped under a `.theme-<brand>` selector, so switching brands is just swapping
 * this class. next-themes' own bootstrap only covers the light/dark class on <html>;
 * the brand class lives on <body> because the generated dark-mode selectors are
 * descendant combinators (`.dark .theme-<brand>`). `ThemeBrandSync` takes over
 * after hydration.
 */
export const THEME_INIT_SCRIPT = /* javascript */ `
const init = () => {
  try {
    const themeKey = localStorage.getItem("theme") || "${DEFAULT_THEME_KEY}"
    const brand = themeKey.indexOf("directory-") === 0 ? "directory" : "landing"

    document.body.classList.remove("theme-landing", "theme-directory")
    document.body.classList.add("theme-" + brand)
    document.documentElement.dataset.brand = brand
  } catch (_error) {}
}

init()
`.trim()

export const STORY_LAYOUT_CONTEXT_ROUTE_STUB = {
  hash: null,
  pathname: "/",
  pathnameWithHash: "/",
} as ClientRoute
