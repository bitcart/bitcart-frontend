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
})
