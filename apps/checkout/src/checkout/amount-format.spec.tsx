import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { i18n } from "@lingui/core"
import { act, screen } from "@testing-library/react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { useAmountFormat } from "./amount-format"
import { makeInvoice } from "./fixtures"
import { renderCheckout } from "./testing/render-checkout"

const FormattedAmounts = () => {
  const format = useAmountFormat()

  return (
    <>
      <p>{format.fiat("1234.50")}</p>
      <p>{format.crypto("0.00150000", "btc")}</p>
    </>
  )
}

const renderInGerman = (browserLocales: string[]) => {
  vi.spyOn(navigator, "languages", "get").mockReturnValue(browserLocales)

  act(() => {
    i18n.loadAndActivate({ locale: "de", messages: {} })
  })

  renderCheckout({
    source: { invoice: makeInvoice({ price: "100.00", currency: "EUR" }) },
    screens: { Payment: FormattedAmounts },
  })
}

afterEach(() => {
  i18n.loadAndActivate({ locale: SOURCE_LOCALE_ID, messages: {} })
  vi.restoreAllMocks()
})

describe("useAmountFormat", () => {
  test("formats in the UI language", () => {
    renderInGerman(["en-US"])

    expect(screen.getByText(/^1\.234,50\s€$/u)).toBeInTheDocument()
    expect(screen.getByText("0,00150000 BTC")).toBeInTheDocument()
  })

  test("takes the region from the browser", () => {
    renderInGerman(["en-US", "de-CH"])

    expect(screen.getByText("0.00150000 BTC")).toBeInTheDocument()
  })
})
