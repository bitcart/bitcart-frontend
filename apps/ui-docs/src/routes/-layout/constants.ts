import {
  BRAND_STORAGE_KEY,
  BRANDS,
  DEFAULT_BRAND,
  MODE_SELECTIONS,
  MODE_STORAGE_KEY,
} from "@/common/constants"

/**
 * Executed as the first element of <body>, before first paint: applies the stored brand's
 * `theme-<brand>` class and `color-scheme`. uno.generated.css carries both brands' CSS
 * variables, each scoped under a `.theme-<brand>` selector, so switching brands is just
 * swapping this class. next-themes' own bootstrap covers the light/dark class on <html>;
 * the brand class lives on <body> because the generated dark-mode selectors are descendant
 * combinators (`.dark .theme-<brand>`). `ThemeSync` takes over after hydration.
 */
export const THEME_INIT_SCRIPT = /* javascript */ `
const init = () => {
  try {
    const brands = ${JSON.stringify(BRANDS)}
    const modeSelections = ${JSON.stringify(MODE_SELECTIONS)}

    const storedBrand = localStorage.getItem("${BRAND_STORAGE_KEY}")
    const storedMode = localStorage.getItem("${MODE_STORAGE_KEY}")

    //! Must precede next-themes' own bootstrap further down this <body>, which would
    //! otherwise apply an unrecognised stored value verbatim as a class.
    if (storedBrand && brands.indexOf(storedBrand) === -1) {
      localStorage.removeItem("${BRAND_STORAGE_KEY}")
    }

    if (storedMode && modeSelections.indexOf(storedMode) === -1) {
      localStorage.removeItem("${MODE_STORAGE_KEY}")
    }

    const brand = brands.indexOf(storedBrand) === -1 ? "${DEFAULT_BRAND}" : storedBrand

    const mode = storedMode === "light" || storedMode === "dark"
      ? storedMode
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

    document.body.classList.remove(...brands.map((themeBrand) => "theme-" + themeBrand))
    document.body.classList.add("theme-" + brand)
    document.documentElement.dataset.brand = brand
    document.documentElement.style.colorScheme = mode
  } catch (_error) {}
}

init()
`.trim()
