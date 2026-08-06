import { describe, expect, test, vi } from "vitest"

import { PSEUDO_LOCALE_ID } from "@/constants"

import { getLanguageEndonym, getLocaleDisplayName } from "./display"

describe("getLanguageEndonym", () => {
  //* Deterministic: this value is hardcoded in our source, not provided by Intl.
  test("returns the hardcoded endonym for Belarusian", () => {
    expect(getLanguageEndonym("be")).toBe("беларуская")
  })

  test("strips the region subtag before matching the Belarusian special case", () => {
    expect(getLanguageEndonym("be-BY")).toBe("беларуская")
  })

  //* Engine-delegated values vary by ICU version, so assert the contract, not the spelling.
  test("returns a non-empty string for a supported language", () => {
    const endonym = getLanguageEndonym("de")

    expect(endonym).toBeTypeOf("string")
    expect(endonym).toBeTruthy()
  })

  test("localizes the name in the language itself, not in English", () => {
    const englishExonym = new Intl.DisplayNames("en", { type: "language" }).of("de")

    //* The endonym ("Deutsch") must differ from the English exonym ("German").
    expect(getLanguageEndonym("de")).not.toBe(englishExonym)
  })

  test("returns undefined when Intl cannot resolve a display name", () => {
    vi.spyOn(Intl.DisplayNames.prototype, "of").mockReturnValue(undefined)

    expect(getLanguageEndonym("en")).toBeUndefined()
  })
})

describe("getLocaleDisplayName", () => {
  test("returns the pseudo locale id verbatim", () => {
    expect(getLocaleDisplayName(PSEUDO_LOCALE_ID)).toBe(PSEUDO_LOCALE_ID)
  })

  test("delegates to the endonym for a real locale", () => {
    expect(getLocaleDisplayName("be")).toBe("беларуская")
  })

  test("falls back to the locale id when no endonym is available", () => {
    vi.spyOn(Intl.DisplayNames.prototype, "of").mockReturnValue(undefined)

    expect(getLocaleDisplayName("en")).toBe("en")
  })
})
