import { screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import type { CheckoutAppearance } from "../model"
import { renderCheckout } from "../testing/render-checkout"
import { StoreBrand } from "./store-brand"

const LOGO = "https://example.com/logo.svg"
const ICON = "https://example.com/icon.svg"

const renderBrand = (appearance: CheckoutAppearance) =>
  renderCheckout({ source: { appearance }, screens: { Payment: StoreBrand } })

describe("StoreBrand", () => {
  test("shows the store's logo under the store's name", () => {
    renderBrand({ logos: { light: LOGO } })

    expect(screen.getByRole("img", { name: "Example Store" })).toHaveAttribute("src", LOGO)
  })

  test("puts a logo made for the other mode on a backdrop of that mode", () => {
    renderBrand({ logos: { dark: LOGO } })

    expect(
      screen.getByRole("img", { name: "Example Store" }).closest("[data-logo-backdrop]"),
    ).toHaveAttribute("data-logo-backdrop", "dark")
  })

  test("shows the icon beside the store's name", () => {
    const { container } = renderBrand({ logos: { light: LOGO }, icons: { light: ICON } })

    expect(container.querySelector(`img[src="${ICON}"]`)).toBeInTheDocument()
    expect(container.querySelector(`img[src="${LOGO}"]`)).not.toBeInTheDocument()
    expect(screen.getByText("Example Store")).toBeInTheDocument()
  })

  test("falls back to the Bitcart wordmark without a logo or an icon", () => {
    renderBrand({ logos: {} })

    expect(screen.getByRole("img", { name: "Bitcart" })).toBeInTheDocument()
    expect(screen.queryByRole("img", { name: "Example Store" })).not.toBeInTheDocument()
  })
})
