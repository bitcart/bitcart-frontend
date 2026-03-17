import type { Theme } from "@unocss/preset-wind4"
import type { Variant } from "unocss"

import { ARIA_BOOLEAN_STATES, BREAKPOINT_SIZES, BREAKPOINTS } from "./constants"
import type { BreakpointKey } from "./types"

export const variants: Variant<Theme>[] = [
  /**
   * Container query variants - @{size}:{utility}
   * Matches @sm:, @md:, @lg:, @xl:, @2xl:, etc.
   */
  (className) => {
    const match = /^@(\w+):/.exec(className)

    if (match === null) {
      return className
    } else {
      const [, size] = match

      const breakpointValue = BREAKPOINT_SIZES.includes(size as BreakpointKey)
        ? BREAKPOINTS[size as BreakpointKey]
        : null

      return breakpointValue === null
        ? className
        : {
            matcher: className.slice(match[0].length),
            selector: (s) => s,
            parent: `@container (min-width: ${breakpointValue})`,
          }
    }
  },

  /**
   * Named container query variants - @{name}/{size}:{utility}
   * Matches @sidebar/sm:, @card/md:, etc.
   */
  (className) => {
    const match = /^@([\w-]+)\/([\w-]+):/.exec(className)

    if (match === null) {
      return className
    } else {
      const [, containerName, size] = match

      const breakpointValue = BREAKPOINT_SIZES.includes(size as BreakpointKey)
        ? BREAKPOINTS[size as BreakpointKey]
        : null

      return breakpointValue === null
        ? className
        : {
            matcher: className.slice(match[0].length),
            selector: (s) => s,
            parent: `@container ${containerName} (min-width: ${breakpointValue})`,
          }
    }
  },

  /**
   * Scroll-state container query variants (unnamed)
   *
   * @scroll-{direction}:{utility} - scrollable state (top, bottom, left, right)
   *
   * @stuck-{direction}:{utility} - stuck state for sticky elements
   * (top, bottom, left, right, inline-start, inline-end, block-start, block-end)
   *
   * @snapped-{axis}:{utility} - scroll snap state (x, y, both, inline, block)
   */
  (className) => {
    // Scrollable state: @scroll-top:, @scroll-bottom:, etc.
    const scrollMatch = /^@scroll-(top|bottom|left|right):/.exec(className)

    if (scrollMatch !== null) {
      const [, direction] = scrollMatch

      return {
        matcher: className.slice(scrollMatch[0].length),
        selector: (s) => s,
        parent: `@container scroll-state(scrollable: ${direction})`,
      }
    }

    // Stuck state: @stuck-top:, @stuck-bottom:, etc.
    const stuckMatch =
      /^@stuck-(top|bottom|left|right|inline-start|inline-end|block-start|block-end):/.exec(
        className,
      )

    if (stuckMatch !== null) {
      const [, direction] = stuckMatch

      return {
        matcher: className.slice(stuckMatch[0].length),
        selector: (s) => s,
        parent: `@container scroll-state(stuck: ${direction})`,
      }
    }

    // Snapped state: @snapped-x:, @snapped-y:, etc.
    const snappedMatch = /^@snapped-(x|y|both|inline|block):/.exec(className)

    if (snappedMatch !== null) {
      const [, axis] = snappedMatch

      return {
        matcher: className.slice(snappedMatch[0].length),
        selector: (s) => s,
        parent: `@container scroll-state(snapped: ${axis})`,
      }
    }

    return className
  },

  /**
   * Named scroll-state container query variants
   * @{name}/scroll-{direction}:{utility} - named scrollable state
   * @{name}/stuck-{direction}:{utility} - named stuck state
   * @{name}/snapped-{axis}:{utility} - named snapped state
   */
  (className) => {
    // Named scrollable state: @document/scroll-top:, @sidebar/scroll-bottom:, etc.
    const scrollMatch = /^@([\w-]+)\/scroll-(top|bottom|left|right):/.exec(className)

    if (scrollMatch !== null) {
      const [, containerName, direction] = scrollMatch

      return {
        matcher: className.slice(scrollMatch[0].length),
        selector: (s) => s,
        parent: `@container ${containerName} scroll-state(scrollable: ${direction})`,
      }
    }

    // Named stuck state: @header/stuck-top:, etc.
    const stuckMatch =
      /^@([\w-]+)\/stuck-(top|bottom|left|right|inline-start|inline-end|block-start|block-end):/.exec(
        className,
      )

    if (stuckMatch !== null) {
      const [, containerName, direction] = stuckMatch

      return {
        matcher: className.slice(stuckMatch[0].length),
        selector: (s) => s,
        parent: `@container ${containerName} scroll-state(stuck: ${direction})`,
      }
    }

    // Named snapped state: @carousel/snapped-x:, etc.
    const snappedMatch = /^@([\w-]+)\/snapped-(x|y|both|inline|block):/.exec(className)

    if (snappedMatch !== null) {
      const [, containerName, axis] = snappedMatch

      return {
        matcher: className.slice(snappedMatch[0].length),
        selector: (s) => s,
        parent: `@container ${containerName} scroll-state(snapped: ${axis})`,
      }
    }

    return className
  },

  /**
   * ARIA boolean state variants - aria-{state}:{utility}
   *
   * Default boolean states:
   *  checked, disabled, expanded, hidden, pressed, readonly, required, selected
   *
   * aria-{state}:        → &[aria-{state}="true"]
   * group-aria-{state}:  → .group[aria-{state}="true"] &
   * peer-aria-{state}:   → .peer[aria-{state}="true"] ~ &
   */
  (className) => {
    const match = new RegExp(
      `^(group-aria|peer-aria|aria)-(${ARIA_BOOLEAN_STATES.join("|")}):`,
    ).exec(className)

    if (match !== null) {
      const [, prefix, state] = match

      switch (prefix) {
        case "group-aria": {
          return {
            matcher: className.slice(match[0].length),
            selector: (s) => `.group[aria-${state}="true"] ${s}`,
          }
        }

        case "peer-aria": {
          return {
            matcher: className.slice(match[0].length),
            selector: (s) => `.peer[aria-${state}="true"] ~ ${s}`,
          }
        }

        default: {
          return {
            matcher: className.slice(match[0].length),
            selector: (s) => `${s}[aria-${state}="true"]`,
          }
        }
      }
    } else return className
  },

  /**
   * Arbitrary ARIA value variants - aria-[attr=value]:{utility}
   * Usage: aria-[sort=ascending]:bg-blue-500 → &[aria-sort="ascending"]
   * Usage: aria-[current=page]:font-bold → &[aria-current="page"]
   */
  (className) => {
    const arbitraryMatch = /^aria-\[([^\]=]+)(?:=([^\]]+))?\]:/.exec(className)

    if (arbitraryMatch !== null) {
      const [, attr, value] = arbitraryMatch

      return {
        matcher: className.slice(arbitraryMatch[0].length),
        selector: (s) => (value ? `${s}[aria-${attr}="${value}"]` : `${s}[aria-${attr}]`),
      }
    } else return className
  },

  /**
   * Boolean data attribute variants - data-{attr}:{utility}
   * Matches presence of a data attribute (no value check).
   * Supports long hyphenated names, e.g. not just data-open:, but also data-popup-open:
   *
   * data-{attr}:        → &[data-{attr}]
   * group-data-{attr}:  → .group[data-{attr}] &
   * peer-data-{attr}:   → .peer[data-{attr}] ~ &
   */
  (className) => {
    const match = new RegExp("^(group-data|peer-data|data)-([\\w][\\w-]*):").exec(className)

    if (match !== null) {
      const [, prefix, attr] = match

      switch (prefix) {
        case "group-data": {
          return {
            matcher: className.slice(match[0].length),
            selector: (s) => `.group[data-${attr}] ${s}`,
          }
        }

        case "peer-data": {
          return {
            matcher: className.slice(match[0].length),
            selector: (s) => `.peer[data-${attr}] ~ ${s}`,
          }
        }

        default: {
          return {
            matcher: className.slice(match[0].length),
            selector: (s) => `${s}[data-${attr}]`,
          }
        }
      }
    } else return className
  },

  /**
   * Paren-free :not() selector variant — avoids `(` and `)` so the UnoCSS
   * VSCode extension's position-finder can locate the token in source.
   *
   *   [&_X:not-[Y]]:  → & X:not(Y)
   *   [&>X:not-[Y]]:  → &>X:not(Y)
   *
   * Usage:
   *   [&_svg:not-[class*='text-']]:text-muted-foreground
   *   [&>button:not-[disabled]]:opacity-100
   */
  (className) => {
    const match = /^\[&([_>])([\w.-]+):not-\[([^\]]+)\]\]:/.exec(className)

    if (match !== null) {
      const [, combinator, selector, condition] = match

      return {
        matcher: className.slice(match[0].length),
        selector:
          combinator === ">"
            ? (s) => `${s}>${selector}:not([${condition}])`
            : (s) => `${s} ${selector}:not([${condition}])`,
      }
    } else return className
  },
]
