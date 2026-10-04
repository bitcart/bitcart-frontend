import { describe, expect, test } from "vitest"

import { defineCheckoutTemplate } from "./template"

const Payment = () => null

describe("defineCheckoutTemplate", () => {
  test("refuses a color scheme with a value that is not a color", () => {
    expect(() =>
      defineCheckoutTemplate({
        name: { id: "Broken" },
        Payment,
        colorScheme: { light: { primary: "#fff; background: url(x)" } },
      }),
    ).toThrow(/not an oklch\(\) color/u)
  })
})
