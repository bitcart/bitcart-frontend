import type { Preflight, PresetWind4Theme } from "unocss"

import { BREAKPOINT_SIZES, BREAKPOINTS } from "./constants"
import type { PresetBitcartPreflight } from "./types"

export const GENERAL_PREFLIGHT: PresetBitcartPreflight = {
  getCSS: () => /* CSS */ `

    @layer base {
      *,
      ::after,
      ::before,
      ::backdrop,
      ::file-selector-button {
        border-color: var(--colors-gray-200, currentColor);
      }

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
      }

      #root {
        width: 100%;
        height: 100%;
        isolation: isolate;
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
            ${BREAKPOINT_SIZES.map((key) => `.blur-${key}`).join(", ")},
            .backdrop-blur,
            ${BREAKPOINT_SIZES.map((key) => `.backdrop-blur-${key}`).join(", ")}
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
      --radius-DEFAULT: ${baseValue}rem;
      --radius-xs: calc(var(--radius-DEFAULT) / 2);
      --radius-sm: var(--radius-DEFAULT);
      --radius-md: calc(var(--radius-DEFAULT) * 1.5);
      --radius-lg: calc(var(--radius-DEFAULT) * 2);
      --radius-xl: calc(var(--radius-DEFAULT) * 3);
      --radius-2xl: calc(var(--radius-DEFAULT) * 4);
      --radius-3xl: calc(var(--radius-DEFAULT) * 6);
      --radius-4xl: calc(var(--radius-DEFAULT) * 8);
    }

`
