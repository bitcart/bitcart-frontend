import type { Preflight, PresetWind4Theme } from "unocss"

import { BREAKPOINT_KEYS } from "#/constants"
import type { Theme } from "#/types"
import { colorPaletteToCssVariables } from "#/utils"

import { BREAKPOINTS, DEFAULT_DARK_MODE_SELECTOR } from "./constants"
import type { PresetBitcartPreflight } from "./types"

export const GENERAL_PREFLIGHT: PresetBitcartPreflight = {
  getCSS: () => /* CSS */ `

    *,
    ::after,
    ::before,
    ::backdrop,
    ::file-selector-button {
      border-color: oklch(var(--border));
    }

    @layer base {
      *[class*="before:"]::before, *[class*="after:"]::after {
        content: var(--un-content);
      }

      :root {
        container: document;
        container-type: scroll-state;
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        width: 100%;
        height: fit-content;
        --current-breakpoint: sm;
      }

      body {
        position: relative;
        overscroll-behavior: none;
        overflow: auto;
        width: 100%;
        height: 100%;
        color: oklch(var(--foreground));
        background: oklch(var(--background));
      }

      #root {
        width: 100%;
        height: 100%;
        isolation: isolate;
      }

      /*
        Korean UI text wraps at spaces, not between syllables; overlong words still break.
        Only elements declaring \`lang\` match, so descendants inherit and utilities still apply.
      */
      [lang]:lang(ko) {
        word-break: keep-all;
        overflow-wrap: break-word;
      }

      [lang]:not(:lang(ko)) {
        word-break: normal;
      }
    }

  `,
}

/**
 * Makes breakpoints available globally as CSS variables.
 */
export const BREAKPOINT_PREFLIGHT: PresetBitcartPreflight = {
  getCSS: () =>
    Object.entries(BREAKPOINTS)
      .map(
        ([key, value]) =>
          /* CSS */ `@media (min-width: ${value}) { :root { --current-breakpoint: ${key}; } }`,
      )
      .join("\n"),
}

/**
 * Suppresses filter / backdrop-filter outside an open Base UI modal subtree
 */
export const MODAL_BLUR_SUPPRESSION_PREFLIGHT: PresetBitcartPreflight = {
  getCSS: () => /* CSS */ `

    @supports (-webkit-touch-callout: none) {
      @media (max-width: ${BREAKPOINTS.md}) {
        body:has([data-slot$="-backdrop"]:is([data-open], [data-ending-style])) #root
          :is(
            .blur,
            ${BREAKPOINT_KEYS.map((key) => `.blur-${key}`).join(", ")},
            .backdrop-blur,
            ${BREAKPOINT_KEYS.map((key) => `.backdrop-blur-${key}`).join(", ")}
          )
        {
          backdrop-filter: none !important;
          background-image: none !important;
          filter: none !important;
        }
      }
    }

  `,
}

/**
 * Defines radius CSS variables based on a base value.
 */
export const createGetRadiusCSSVariables: (
  baseValue: number,
) => Preflight<PresetWind4Theme>["getCSS"] = (baseValue) => () =>
  /* CSS */ `

    :root, :host {
      --radius: ${baseValue}rem;
      --radius-xs: calc(var(--radius) / 2);
      --radius-sm: var(--radius);
      --radius-md: calc(var(--radius) * 1.5);
      --radius-lg: calc(var(--radius) * 2);
      --radius-xl: calc(var(--radius) * 3);
      --radius-2xl: calc(var(--radius) * 4);
      --radius-3xl: calc(var(--radius) * 6);
      --radius-4xl: calc(var(--radius) * 8);
    }

`

/**
 * Defines CSS variables for every palette color token.
 *
 * A single theme declares them on `:root` and `.dark`. Each theme of an array declares them under
 * `.theme-<name>` and `.dark .theme-<name>`.
 */
export const createGetPaletteCSSVariables: (
  brandTheme: Theme | Theme[],
) => Preflight<PresetWind4Theme>["getCSS"] = (brandTheme) => () =>
  (Array.isArray(brandTheme) ? brandTheme : [brandTheme])
    .map(({ name, light, dark }) => {
      const selector = Array.isArray(brandTheme) ? `.theme-${name}` : ":root"

      const darkSelector = Array.isArray(brandTheme)
        ? `${DEFAULT_DARK_MODE_SELECTOR} ${selector}`
        : DEFAULT_DARK_MODE_SELECTOR

      return (
        `${selector} {\n${colorPaletteToCssVariables(light)}\n}\n` +
        `${darkSelector} {\n${colorPaletteToCssVariables(dark)}\n}`
      )
    })
    .join("\n")
