import { describe, expect, test } from "vitest"

import {
  formatCryptoAmount,
  formatDecimalAmount,
  formatFiatAmount,
  formatRate,
  resolveFormattingLocale,
} from "./amount-format"

describe("resolveFormattingLocale", () => {
  test("takes the region from the first browser locale in the UI language", () => {
    expect(resolveFormattingLocale("de", ["en-US", "de-CH", "de-DE"])).toBe("de-CH")
  })

  test("keeps the UI locale when no browser locale shares its language", () => {
    expect(resolveFormattingLocale("de", ["en-US", "fr-FR"])).toBe("de")
  })
})

describe("formatFiatAmount", () => {
  test("keeps exactly the decimals the backend sent", () => {
    expect(formatFiatAmount("25.00", "USD", "en-US")).toBe("$25.00")
    expect(formatFiatAmount("1500", "ARS", "en-US")).toBe("ARS\u00a01,500")
    expect(formatFiatAmount("1234.5", "USD", "en-US")).toBe("$1,234.5")
  })

  test("follows the locale's conventions", () => {
    expect(formatFiatAmount("1234.50", "EUR", "de-DE")).toBe("1.234,50\u00a0€")
  })

  test("never rounds through a float", () => {
    expect(formatFiatAmount("123456789012345678.25", "USD", "en-US")).toBe(
      "$123,456,789,012,345,678.25",
    )
  })

  test("formats a currency Intl doesn't know like a crypto amount", () => {
    expect(formatFiatAmount("1.00", "USDT", "en-US")).toBe("1.00 USDT")
    expect(formatFiatAmount("0.50000000", "BTC", "en-US")).toBe("0.50000000 BTC")
  })
})

describe("formatCryptoAmount", () => {
  test("keeps every decimal and appends the coin's symbol", () => {
    expect(formatCryptoAmount("0.00150000", "btc", "de-DE")).toBe("0,00150000 BTC")
  })

  test("keeps all 18 decimals", () => {
    expect(formatDecimalAmount("0.123456789012345678", "en-US")).toBe("0.123456789012345678")
  })
})

describe("formatRate", () => {
  test.each([
    ["66666.666", "$66,666.67"],
    ["0.004", "$0.004"],
    ["0.0041234", "$0.00412"],
    ["0.0041250", "$0.00413"],
    ["2.5", "$2.50"],
  ])("formats %s as %s", (rate, expected) => {
    expect(formatRate(rate, "USD", 2, "en-US")).toBe(expected)
  })
})
