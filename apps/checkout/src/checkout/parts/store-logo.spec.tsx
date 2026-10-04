import { screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { renderCheckout } from "../testing/render-checkout"
import { StoreLogo } from "./store-logo"

const LOGO = "https://example.com/logo.svg"

describe("StoreLogo", () => {
  test("shows the store's logo under the store's name", () => {
    renderCheckout({
      source: { appearance: { logos: { light: LOGO } } },
      screens: { Payment: StoreLogo },
    })

    expect(screen.getByRole("img", { name: "Example Store" })).toHaveAttribute("src", LOGO)
  })

  test("puts a logo made for the other mode on a backdrop of that mode", () => {
    renderCheckout({
      source: { appearance: { logos: { dark: LOGO } } },
      screens: { Payment: StoreLogo },
    })

    expect(
      screen.getByRole("img", { name: "Example Store" }).closest("[data-logo-backdrop]"),
    ).toHaveAttribute("data-logo-backdrop", "dark")
  })

  test("falls back to the Bitcart wordmark without a store logo", () => {
    renderCheckout({ source: { appearance: { logos: {} } }, screens: { Payment: StoreLogo } })

    expect(screen.getByRole("img", { name: "Bitcart" })).toBeInTheDocument()
    expect(screen.queryByRole("img", { name: "Example Store" })).not.toBeInTheDocument()
  })
})
