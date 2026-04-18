import type { PresetWind4Theme, Variant } from "unocss"

import { ARIA_BOOLEAN_STATES, BREAKPOINT_SIZES, BREAKPOINTS } from "./constants"
import type { BreakpointKey } from "./types"

export const variants: Variant<PresetWind4Theme>[] = [
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
   * has-[...] variant with arbitrary selector — :has(...)
   *
   * Overrides the native wind4 handler to pass comma-separated selectors
   * through as raw CSS. The native handler incorrectly treats commas as
   * theme-value separators, producing :has(undefined) for OR-logic patterns like:
   *   has-[+[data-slot=trigger],+[data-slot=clear]]:pe-7
   *
   * Supports one level of nested brackets (for attribute selectors).
   */
  (className) => {
    const match = /^has-\[((?:[^[\]]|\[[^[\]]*\])*)\]:/.exec(className)

    if (match !== null) {
      const [, selector] = match

      return {
        matcher: className.slice(match[0].length),
        selector: (s) => `${s}:has(${selector})`,
      }
    } else return className
  },

  /**
   * has-aria-{attr} shorthand variant — :has([aria-{attr}])
   *
   * Extends UnoCSS wind4's built-in has-{pseudo} shorthands to cover ARIA
   * attribute presence selectors, which the built-in does not handle.
   *
   * has-aria-{attr}:utility → &:has([aria-{attr}])
   *
   * e.g.:
   *   has-aria-invalid:border-destructive/36 → &:has([aria-invalid])
   *   has-aria-checked:opacity-80            → &:has([aria-checked])
   */
  (className) => {
    const match = /^has-aria-([\w-]+):/.exec(className)

    if (match !== null) {
      const [, attr] = match

      return {
        matcher: className.slice(match[0].length),
        selector: (s) => `${s}:has([aria-${attr}])`,
      }
    } else return className
  },

  /**
   * Boolean data attribute variants - data-{attr}:{utility}
   * Matches presence of a data attribute (no value check).
   * Supports long hyphenated names, e.g. not just data-open:, but also data-popup-open:
   *
   * data-{attr}:        → &[data-{attr}]          (greedy — chains allowed)
   * group-data-{attr}:  → .group[data-{attr}] &
   * peer-data-{attr}:   → .peer[data-{attr}] ~ &
   */
  (className) => {
    /**
     * group-data / peer-data — context selectors, single-pass
     */
    const contextMatch = /^(group-data|peer-data)-([\w][\w-]*):/.exec(className)

    if (contextMatch !== null) {
      const [, prefix, attr] = contextMatch

      return {
        matcher: className.slice(contextMatch[0].length),
        selector:
          prefix === "group-data"
            ? (s) => `.group[data-${attr}] ${s}`
            : (s) => `.peer[data-${attr}] ~ ${s}`,
      }
    }

    // Bare data-{attr}: — greedily consume all consecutive segments.
    // Handles chains like data-nested:data-ending-style:translate-y-8
    //   → &[data-nested][data-ending-style]
    const attrs: string[] = []
    let remaining = className

    while (true) {
      const m = /^data-([\w][\w-]*):/.exec(remaining)

      if (m === null) break

      attrs.push(m[1])
      remaining = remaining.slice(m[0].length)
    }

    if (attrs.length === 0) return className

    return {
      matcher: remaining,
      selector: (s) => `${s}${attrs.map((a) => `[data-${a}]`).join("")}`,
    }
  },

  /**
   * not-data-{attr} variant — :not([data-{attr}])
   *
   * Greedy — consumes all consecutive not-data-* segments in one pass.
   *
   * not-data-{attr}:utility → &:not([data-{attr}])
   *
   * Chained form:
   *   not-data-starting-style:not-data-ending-style:transition-[...]
   *     → &:not([data-starting-style]):not([data-ending-style])
   */
  (className) => {
    const attrs: string[] = []
    let remaining = className

    while (true) {
      const m = /^not-data-([\w][\w-]*):/.exec(remaining)

      if (m === null) break

      attrs.push(m[1])
      remaining = remaining.slice(m[0].length)
    }

    if (attrs.length === 0) return className

    return {
      matcher: remaining,
      selector: (s) => `${s}${attrs.map((a) => `:not([data-${a}])`).join("")}`,
    }
  },

  /**
   * not-has-* variants — :not(:has(...))
   *
   * Greedily consumes ALL consecutive not-has-* segments in one pass so that
   * chained forms work without depending on multiple custom-variant cycles.
   *
   * Bracket form (supports one level of nested brackets):
   *   not-has-[X]:utility              → &:not(:has(X))
   *   not-has-[+[data-slot=foo]]:ring  → &:not(:has(+[data-slot=foo]))
   *   not-has-[>*.w-full]:w-fit        → &:not(:has(>*.w-full))
   *
   * Shorthand form (mirrors UnoCSS wind4 has-{state} shorthands):
   *   not-has-{pseudo}:utility         → &:not(:has(:{pseudo}))
   *   not-has-aria-{attr}:utility      → &:not(:has([aria-{attr}]))
   *
   * Chained form (both bracket and shorthand, any mix):
   *   not-has-disabled:not-has-focus-visible:before:shadow-xs
   *     → &:not(:has(:disabled)):not(:has(:focus-visible))
   *   not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-xs
   *     → &:not(:has(:disabled)):not(:has(:focus-visible)):not(:has([aria-invalid]))
   */
  (className) => {
    const segments: string[] = []
    let remaining = className

    while (true) {
      /**
       * Bracket form — try first (more specific)
       */
      const bracketMatch = /^not-has-\[((?:[^[\]]|\[[^[\]]*\])*)\]:/.exec(remaining)

      if (bracketMatch !== null) {
        segments.push(bracketMatch[1])
        remaining = remaining.slice(bracketMatch[0].length)
        continue
      }

      /**
       * Shorthand form — pseudo-class or aria-* attribute
       */
      const shorthandMatch = /^not-has-([\w-]+):/.exec(remaining)

      if (shorthandMatch !== null) {
        const state = shorthandMatch[1]
        segments.push(state.startsWith("aria-") ? `[${state}]` : `:${state}`)
        remaining = remaining.slice(shorthandMatch[0].length)
        continue
      }

      break
    }

    if (segments.length === 0) return className

    return {
      matcher: remaining,
      selector: (s) => `${s}${segments.map((sel) => `:not(:has(${sel}))`).join("")}`,
    }
  },

  /**
   * pointer / any-pointer media query variants
   *
   * pointer-{value}:utility     → @media (pointer: value) { ... }
   * any-pointer-{value}:utility → @media (any-pointer: value) { ... }
   *
   * Valid values: none | coarse | fine
   */
  (className) => {
    const match = /^(any-pointer|pointer)-(none|coarse|fine):/.exec(className)

    if (match !== null) {
      const [, feature, value] = match

      return {
        matcher: className.slice(match[0].length),
        selector: (s) => s,
        parent: `@media (${feature}: ${value})`,
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
