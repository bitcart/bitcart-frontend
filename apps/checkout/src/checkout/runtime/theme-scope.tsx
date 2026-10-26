import type { ReactNode } from "react"

import type { CheckoutPalette, CheckoutThemeToken, OklchTriplet } from "../theme/palette"

type TokenValues = Partial<Record<CheckoutThemeToken, OklchTriplet>>

const mergePalettes = (palettes: (CheckoutPalette | null | undefined)[]): CheckoutPalette =>
  palettes.reduce<CheckoutPalette>(
    (merged, palette) => ({
      light: { ...merged.light, ...palette?.light },
      dark: { ...merged.dark, ...palette?.dark },
    }),
    { light: {}, dark: {} },
  )

//! Re-declares both `--colors-<token>` and `--colors-<token>-DEFAULT` for every token. UnoCSS
//! declares these aliases on `:root` as `oklch(var(--token))`, and a custom property resolves its
//! `var()` at its declaration: the root aliases always carry the root tokens.
const toDeclarations = ([token, value]: [string, OklchTriplet]) => [
  `--${token}: ${value};`,
  `--colors-${token}: oklch(var(--${token}));`,
  `--colors-${token}-DEFAULT: oklch(var(--${token}));`,
]

const toRule = (selector: string, tokens: TokenValues) => {
  const declarations = (Object.entries(tokens) as [string, OklchTriplet][]).flatMap(toDeclarations)

  return declarations.length > 0 ? `${selector} { ${declarations.join(" ")} }` : ""
}

/**
 * Themes the whole page while its wrapper is mounted: a template's screens, or the receipt. The
 * tokens go on `:root`, so the page around the card and portaled overlays such as dialogs follow
 * them too.
 *
 * Layers the given palettes in order, token by token over the base theme on `:root`: a template's
 * colors, then the merchant palette. The generated CSS carries no free input: every value is a
 * parsed OKLCH triplet and the id a kebab-case template folder name or a fixed app id.
 */
export const CheckoutThemeScope = ({
  scopeId,
  palettes,
  children,
}: {
  scopeId: string
  palettes: (CheckoutPalette | null | undefined)[]
  children: ReactNode
}) => {
  const { light, dark } = mergePalettes(palettes)
  const scope = `:has([data-checkout-theme="${scopeId}"])`

  const css = [toRule(`:root:not(.dark)${scope}`, light), toRule(`:root.dark${scope}`, dark)]
    .filter(Boolean)
    .join("\n")

  return (
    <div data-checkout-theme={scopeId} className="contents">
      {css && <style>{css}</style>}
      {children}
    </div>
  )
}
