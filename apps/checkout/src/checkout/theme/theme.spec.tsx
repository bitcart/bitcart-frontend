import { GLOBAL_THEME_OVERRIDE_TESTID } from "@bitcart/qa"
import { screen } from "@testing-library/react"
import { isNullish, unique } from "remeda"
import { describe, expect, test } from "vitest"

import { useCheckout } from "../hooks"
import { defineCheckoutTemplate } from "../template"
import { renderCheckout } from "../testing/render-checkout"
import { checkoutThemeSchema } from "./schemas"

const PaymentScreen = () => <p>Pay {useCheckout("payment").payment.name}</p>

const RED = "0.628 0.258 29.234"
const LIME = "0.866 0.295 142.495"
const BLUE = "0.452 0.313 264.052"

const themeOverrideStylesheets = () => [
  ...document.querySelectorAll<HTMLStyleElement>(`[data-testid="${GLOBAL_THEME_OVERRIDE_TESTID}"]`),
]

const themeOverrideStylesheet = () => themeOverrideStylesheets()[0] ?? null

const themeOverrideRules = () =>
  [...(themeOverrideStylesheet()?.sheet?.cssRules ?? [])].filter(
    (rule): rule is CSSStyleRule => rule instanceof CSSStyleRule,
  )

const globalThemeOverrideDeclarationsByColorScheme = () => {
  const stylesheetElementId = themeOverrideStylesheet()?.id
  const rules = themeOverrideRules()

  const tokensOf = (rootSelector: string) => {
    const rule = rules.find(
      (candidate) => candidate.selectorText === `${rootSelector}:has(#${stylesheetElementId})`,
    )

    return isNullish(rule)
      ? null
      : Object.fromEntries(
          [...rule.style].map((property) => [property, rule.style.getPropertyValue(property)]),
        )
  }

  return { light: tokensOf(":root:not(.dark)"), dark: tokensOf(":root.dark") }
}

const declarationPriorities = () =>
  unique(
    themeOverrideRules().flatMap((rule) =>
      [...rule.style].map((property) => rule.style.getPropertyPriority(property)),
    ),
  )

describe("checkout theme", () => {
  test("renders the template inside its wrapper", () => {
    renderCheckout({ templateId: "receipt", screens: { Payment: PaymentScreen } })

    const payment = screen.getByText("Pay BTC")

    expect(payment.closest("[data-checkout-template]")).toHaveAttribute(
      "data-checkout-template",
      "receipt",
    )
  })

  test("layers the merchant theme over the template colors, token by token", () => {
    renderCheckout({
      templateId: "receipt",

      screens: defineCheckoutTemplate({
        name: { id: "Receipt" },
        Payment: PaymentScreen,
        theme: { light: { primary: `oklch(${RED})`, ring: `oklch(${RED})` } },
      }),

      source: {
        appearance: {
          theme: checkoutThemeSchema.parse({
            light: { primary: `oklch(${LIME})` },
            dark: { success: `oklch(${BLUE})` },
          }),
        },
      },
    })

    expect(globalThemeOverrideDeclarationsByColorScheme()).toStrictEqual({
      light: { "--primary": LIME, "--primary-text": LIME, "--ring": RED },
      dark: { "--success": BLUE },
    })

    expect(declarationPriorities()).toStrictEqual(["important"])

    expect(themeOverrideStylesheets()).toHaveLength(1)
  })

  test("keeps the preset tokens without template colors or a merchant theme", () => {
    renderCheckout({ templateId: "receipt", screens: { Payment: PaymentScreen } })

    expect(themeOverrideStylesheets()).toHaveLength(0)

    expect(globalThemeOverrideDeclarationsByColorScheme()).toStrictEqual({
      light: null,
      dark: null,
    })
  })
})
