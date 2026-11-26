import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { BitcartLogoIcon } from "./bitcart-logo"

afterEach(() => {
  cleanup()
})

describe("BitcartLogoIcon", () => {
  test("paints with the current text color, without a style element or ids", () => {
    const { container } = render(<BitcartLogoIcon />)

    expect(container.querySelector("svg")?.getAttribute("fill")).toBe("currentColor")
    expect(container.querySelector("style")).toBeNull()
    expect(container.querySelector("[id]")).toBeNull()
  })
})
