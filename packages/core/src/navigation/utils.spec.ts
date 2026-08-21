import { describe, expect, test } from "vitest"

import { getDestinationTypeAwareLinkProps, isExternalHref, isInternalHref } from "./utils"

describe("isInternalHref", () => {
  test.each(["/", "/about", "/about/#features"])("accepts the absolute path %s", (href) => {
    expect(isInternalHref(href)).toBe(true)
  })

  test.each(["#features", "?tab=fees"])("accepts the bare %s", (href) => {
    expect(isInternalHref(href)).toBe(true)
  })

  test.each(["https://example.com", "http://example.com", "mailto:a@b.c", "tel:+123"])(
    "rejects %s",

    (href) => {
      expect(isInternalHref(href)).toBe(false)
    },
  )

  test("rejects a protocol-relative URL", () => {
    expect(isInternalHref("//cdn.example.com/app.js")).toBe(false)
  })
})

describe("isExternalHref", () => {
  test.each([
    "//cdn.example.com/app.js",
    "http://example.com",
    "https://example.com",
    "mailto:a@b.c",
    "tel:+123",
  ])("accepts %s", (href) => {
    expect(isExternalHref(href)).toBe(true)
  })

  test.each(["/about", "#features", "?tab=fees"])("rejects the internal href %s", (href) => {
    expect(isExternalHref(href)).toBe(false)
  })
})

describe("href classification", () => {
  test.each(["docs/intro", "", "javascript:void 0"])("leaves %s unclassified", (href) => {
    expect(isInternalHref(href)).toBe(false)
    expect(isExternalHref(href)).toBe(false)
  })
})

describe("getDestinationTypeAwareLinkProps", () => {
  test("opens a cross-origin destination in a new tab", () => {
    expect(getDestinationTypeAwareLinkProps({ href: "https://example.com" })).toEqual({
      target: "_blank",
      rel: "noopener",
    })
  })

  test("drops the referrer when the destination is not origin-aware", () => {
    expect(
      getDestinationTypeAwareLinkProps({ href: "https://example.com", isOriginAware: false }),
    ).toEqual({ target: "_blank", rel: "noopener noreferrer" })
  })

  test.each(["mailto:a@b.c", "tel:+123"])("adds no new-tab props to the app handoff %s", (href) => {
    expect(getDestinationTypeAwareLinkProps({ href })).toEqual({})
  })

  test.each(["/about", "#features", "?tab=fees"])(
    "adds no new-tab props to the internal href %s",

    (href) => {
      expect(getDestinationTypeAwareLinkProps({ href })).toEqual({})
    },
  )

  test("adds no new-tab props to a relative path", () => {
    expect(getDestinationTypeAwareLinkProps({ href: "docs/intro" })).toEqual({})
  })
})
