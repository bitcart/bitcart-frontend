import { screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { useCheckout } from "../hooks"
import { defineCheckoutTemplate } from "../template"
import { renderCheckout } from "../testing/render-checkout"
import { checkoutPaletteSchema } from "../theme/palette"

const PaymentScreen = () => <p>Pay {useCheckout("payment").payment.name}</p>

const RED = "0.628 0.258 29.234"
const LIME = "0.866 0.295 142.495"
const BLUE = "0.452 0.313 264.052"

const scopedDeclarations = (templateId: string) => {
  //! jsdom keeps the sheets of removed `<style>` elements in `document.styleSheets`.
  const rules = [...document.querySelectorAll("style")].flatMap((style) => [
    ...(style.sheet?.cssRules ?? []),
  ])

  const tokensOf = (selector: string) => {
    const rule = rules.find(
      (candidate): candidate is CSSStyleRule =>
        candidate instanceof CSSStyleRule && candidate.selectorText === selector,
    )

    return rule
      ? Object.fromEntries(
          [...rule.style].map((property) => [property, rule.style.getPropertyValue(property)]),
        )
      : null
  }

  return {
    light: tokensOf(`:root:not(.dark) [data-checkout-template="${templateId}"]`),
    dark: tokensOf(`:root.dark [data-checkout-template="${templateId}"]`),
  }
}

const withoutAliases = (declarations: Record<string, string> | null) =>
  declarations &&
  Object.fromEntries(
    Object.entries(declarations).filter(([property]) => !property.startsWith("--colors-")),
  )

const tokenRules = (templateId: string) => {
  const { light, dark } = scopedDeclarations(templateId)

  return { light: withoutAliases(light), dark: withoutAliases(dark) }
}

describe("checkout theme", () => {
  test("renders the template inside its themed wrapper", () => {
    renderCheckout({ templateId: "receipt", screens: { Payment: PaymentScreen } })

    expect(screen.getByText("Pay BTC").closest("[data-checkout-template]")).toHaveAttribute(
      "data-checkout-template",
      "receipt",
    )
  })

  test("layers the merchant palette over the template colors, token by token", () => {
    renderCheckout({
      templateId: "receipt",

      screens: defineCheckoutTemplate({
        name: { id: "Receipt" },
        Payment: PaymentScreen,
        colorScheme: { light: { primary: `oklch(${RED})`, ring: `oklch(${RED})` } },
      }),

      source: {
        appearance: {
          palette: checkoutPaletteSchema.parse({
            light: { primary: `oklch(${LIME})` },
            dark: { success: `oklch(${BLUE})` },
          }),
        },
      },
    })

    expect(tokenRules("receipt")).toStrictEqual({
      light: { "--primary": LIME, "--ring": RED },
      dark: { "--success": BLUE },
    })
  })

  test("keeps the preset tokens without template colors or a merchant palette", () => {
    renderCheckout({ templateId: "receipt", screens: { Payment: PaymentScreen } })

    expect(tokenRules("receipt")).toStrictEqual({ light: null, dark: null })
  })

  //! jsdom cannot resolve the cascade. The test asserts the declarations resolved by a browser: a
  //! `--colors-*` alias declared on `:root` keeps the root token, and gradients read the aliases.
  test("re-resolves the theme's color aliases inside the wrapper", () => {
    renderCheckout({
      templateId: "receipt",
      screens: { Payment: PaymentScreen },

      source: {
        appearance: {
          palette: checkoutPaletteSchema.parse({ light: { primary: `oklch(${LIME})` } }),
        },
      },
    })

    expect(scopedDeclarations("receipt").light).toMatchObject({
      "--colors-primary": "oklch(var(--primary))",
      "--colors-primary-DEFAULT": "oklch(var(--primary))",
    })
  })
})
