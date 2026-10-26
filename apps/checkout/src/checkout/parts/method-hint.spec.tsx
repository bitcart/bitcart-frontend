import { CHECKOUT_METHOD_HINT_TESTID } from "@bitcart/qa"
import { screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makePayment } from "../fixtures"
import { renderCheckout } from "../testing/render-checkout"
import { MethodHint } from "./method-hint"

const renderHint = (hint: string | null) =>
  renderCheckout({
    source: { invoice: makeInvoice({ payments: [makePayment({ hint })] }) },
    screens: { Payment: () => <MethodHint /> },
  })

describe("MethodHint", () => {
  test("shows the store's note for the method", () => {
    renderHint("Use the Tron network only")

    expect(screen.getByText("Use the Tron network only")).toBeInTheDocument()
  })

  test.each([null, "", "   "])("shows nothing for the hint %o", (hint) => {
    renderHint(hint)

    expect(screen.queryByTestId(CHECKOUT_METHOD_HINT_TESTID)).not.toBeInTheDocument()
  })

  test("renders markup in the hint as text", () => {
    renderHint("<b>bold</b>")

    expect(screen.getByText("<b>bold</b>")).toBeInTheDocument()
    expect(screen.getByTestId(CHECKOUT_METHOD_HINT_TESTID).querySelector("b")).toBeNull()
  })
})
