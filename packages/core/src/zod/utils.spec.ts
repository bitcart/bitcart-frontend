import { expect, test, describe } from "vitest"
import { z } from "zod"

import { emptyAsUndefined } from "./utils"

describe("emptyAsUndefined", () => {
  describe("with an optional string schema", () => {
    const schema = emptyAsUndefined(z.string().optional())

    test("coerces an empty string to undefined", () => {
      expect(schema.parse("")).toBeUndefined()
    })

    test("passes undefined through as undefined", () => {
      expect(schema.parse(undefined)).toBeUndefined()
    })

    test("leaves a non-empty string untouched", () => {
      expect(schema.parse("hello")).toBe("hello")
    })

    test("treats a whitespace-only string as non-empty", () => {
      expect(schema.parse("   ")).toBe("   ")
    })

    test("rejects non-string input", () => {
      expect(schema.safeParse(42).success).toBe(false)
      expect(schema.safeParse(null).success).toBe(false)
    })
  })

  describe("with an optional url schema", () => {
    const schema = emptyAsUndefined(z.url().optional())

    test("coerces an empty string to undefined, bypassing url validation", () => {
      expect(schema.parse("")).toBeUndefined()
    })

    test("passes undefined through as undefined", () => {
      expect(schema.parse(undefined)).toBeUndefined()
    })

    test("leaves a valid url untouched", () => {
      expect(schema.parse("https://bitcart.ai")).toBe("https://bitcart.ai")
    })

    test("rejects a non-empty invalid url", () => {
      expect(schema.safeParse("not-a-url").success).toBe(false)
    })
  })

  test("lets an empty string bypass the wrapped schema's constraints", () => {
    const schema = emptyAsUndefined(z.string().min(3).optional())

    expect(schema.parse("")).toBeUndefined()
    expect(schema.safeParse("ab").success).toBe(false)
  })
})
