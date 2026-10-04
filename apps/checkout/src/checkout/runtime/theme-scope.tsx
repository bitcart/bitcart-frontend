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
 * Scopes the theme tokens of a template to its wrapper.
 *
 * Layers the template colors, then the merchant palette, token by token over the base theme on
 * `:root`. The generated CSS carries no free input: every value is a parsed OKLCH triplet and the
 * id a kebab-case folder name.
 */
export const CheckoutThemeScope = ({
  templateId,
  palettes,
  children,
}: {
  templateId: string
  palettes: (CheckoutPalette | null | undefined)[]
  children: ReactNode
}) => {
  const { light, dark } = mergePalettes(palettes)
  const scope = `[data-checkout-template="${templateId}"]`

  const css = [toRule(`:root:not(.dark) ${scope}`, light), toRule(`:root.dark ${scope}`, dark)]
    .filter(Boolean)
    .join("\n")

  return (
    <div data-checkout-template={templateId} className="contents">
      {css && <style>{css}</style>}
      {children}
    </div>
  )
}
