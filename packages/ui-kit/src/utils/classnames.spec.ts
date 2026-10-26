import { describe, expect, test } from "vitest"

import { cn } from "./classnames"

describe("cn", () => {
  test("lets a later shadow replace an elevation", () => {
    expect(cn("elevation-1 border", "shadow-2xl")).toBe("border shadow-2xl")
  })

  test("lets a later elevation replace a shadow", () => {
    expect(cn("shadow-sm", "elevation-none")).toBe("elevation-none")
  })
})
