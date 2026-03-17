import { Theme } from "@unocss/preset-wind4"
import type { Preflight } from "unocss"

import { BREAKPOINTS } from "./constants"

export const getPreflightCSS: Preflight<Theme>["getCSS"] = ({ theme }) => /* CSS */ `
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--colors-gray-200, currentColor);
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
    overscroll-behavior: none;
    overflow: auto;
    width: 100%;
    height: 100%;
  }

  #root {
    width: 100%;
    height: 100%;
  }

  /* FIXME: Break into rules ( see https://unocss.dev/config/rules ) */
  .glassy {
    background-color: rgb(255 255 255 / 0.5);
    backdrop-filter: blur(12px);
  }

  :root.dark .glassy {
    background-color: rgb(17 24 39 / 0.5);
  }

  @media (prefers-scheme: dark) {
    :root:not(:is(.dark, .light)) .glassy {
      background-color: rgb(17 24 39 / 0.5);
    }
  }

  /* FIXME: Reimplement using @container-scroll-state rules */
  /* Scroll-dependent header behavior */
  @supports (container-type: scroll-state) {
    @container document scroll-state(scrollable: top) {
      .glassy-header {
        background-color: rgb(255 255 255 / 0.5);
        backdrop-filter: blur(12px);

        ${
          theme.shadow?.lg === undefined
            ? ""
            : `box-shadow: ${[theme.shadow.lg]
                .flat()
                .map((v) => v)
                .join(",")};`
        }
      }
    }

    /* Manual dark mode */
    @container document scroll-state(scrollable: top) {
      :root.dark .glassy-header {
        background-color: rgb(17 24 39 / 0.5);
      }
    }

    /* System-defined dark mode */
    @media (prefers-scheme: dark) {
      @container document scroll-state(scrollable: top) {
        :root:not(:is(.dark, .light)) .glassy-header {
          background-color: rgb(17 24 39 / 0.5);
        }
      }
    }
  }
}
`

/**
 * Defines radius CSS variables based on a base value.
 */
export const createGetRadiusCSSVariables: (baseValue: number) => Preflight<Theme>["getCSS"] =
  (baseValue) => () =>
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

/**
 * Makes breakpoints available globally as CSS variables.
 */
export const getBreakpointCSSVariables: Preflight<Theme>["getCSS"] = () =>
  Object.entries(BREAKPOINTS)
    .map(
      ([key, value]) =>
        /* CSS */ `@media (min-width: ${value}) { :root { --current-breakpoint: ${key}; } }`,
    )
    .join("\n")
