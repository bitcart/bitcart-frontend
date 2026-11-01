import { describe, expect, test } from "vitest"

import { defineCheckoutTemplate } from "./template"

const Payment = () => null

describe("defineCheckoutTemplate", () => {
  test("rejects a theme that contains at least one invalid color specifier", () => {
    expect(() =>
      defineCheckoutTemplate({
        name: { id: "Broken" },
        Payment,

        // @ts-expect-error The value is deliberately invalid.
        theme: { light: { primary: "#fff; background: url(x)" } },
      }),
    ).toThrow(/not an oklch\(\) color/u)
  })
})
