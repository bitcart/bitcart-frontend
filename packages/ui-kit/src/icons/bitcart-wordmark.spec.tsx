import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { BitcartWordmarkIcon } from "./bitcart-wordmark"

afterEach(() => {
  cleanup()
})

describe("BitcartWordmarkIcon", () => {
  test("names itself after the brand it spells", () => {
    render(<BitcartWordmarkIcon />)

    expect(screen.getByRole("img", { name: "Bitcart" })).toBeTruthy()
  })

  test("can be hidden where it is only decorative", () => {
    render(<BitcartWordmarkIcon aria-hidden />)

    expect(screen.queryByRole("img")).toBeNull()
  })

  test("carries no style element, which would restyle every SVG on the page", () => {
    const { container } = render(<BitcartWordmarkIcon />)

    expect(container.querySelector("style")).toBeNull()
  })

  test("gives each copy its own gradient ids and paints from them", () => {
    const { container } = render(
      <>
        <BitcartWordmarkIcon />
        <BitcartWordmarkIcon />
      </>,
    )

    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id)

    expect(new Set(ids).size).toBe(ids.length)

    for (const svg of container.querySelectorAll("svg")) {
      const ownIds = new Set([...svg.querySelectorAll("[id]")].map((element) => element.id))

      const references = [...svg.querySelectorAll("[fill^='url(#'], [href^='#']")].map((element) =>
        (element.getAttribute("href") ?? element.getAttribute("fill") ?? "").replace(
          /^url\(#(.*)\)$|^#/,
          "$1",
        ),
      )

      expect(references).toHaveLength(7)
      expect(references.every((reference) => ownIds.has(reference))).toBe(true)
    }
  })
})
