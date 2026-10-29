import { describe, expect, test } from "vitest"

import { CHECKOUT_URL_PLACEHOLDER, parseCheckoutUrl } from "./injected-checkout-url"

describe("parseCheckoutUrl", () => {
  test.each([
    ["an https origin", "https://checkout.example.com", "https://checkout.example.com"],
    ["a trailing slash", "https://checkout.example.com/", "https://checkout.example.com"],
    ["a path", "https://example.com/pay/", "https://example.com/pay"],
    ["an http origin", "http://checkout.example.local", "http://checkout.example.local"],
  ])("keeps %s", (_case, value, url) => {
    expect(parseCheckoutUrl(value)).toBe(url)
  })

  test.each([
    ["the untouched placeholder", CHECKOUT_URL_PLACEHOLDER],
    ["an empty value", ""],
    ["a host without a scheme", "checkout.example.com"],
    ["a script URL", "javascript:alert(1)"],
    ["another scheme", "ftp://checkout.example.com"],
  ])("ignores %s", (_case, value) => {
    expect(parseCheckoutUrl(value)).toBeNull()
  })
})
