import { describe, expect, test } from "vitest"

import { resolveScriptBase, stripTrailingSlashes } from "./script-base"

const createDocument = ({ current, scripts = [] }: { current?: string; scripts?: string[] }) => {
  const toScript = (src: string) => Object.assign(document.createElement("script"), { src })

  return {
    currentScript: current === undefined ? null : toScript(current),
    scripts: scripts.map(toScript),
  } as unknown as Document
}

describe("resolveScriptBase", () => {
  test.each([
    ["at the root", "https://pay.example.com/embed/v1.js", "https://pay.example.com"],
    ["under a path", "https://example.com/pay/embed/v1.js", "https://example.com/pay"],
    [
      "with a query and a hash",
      "https://pay.example.com/embed/v1.js?v=2#x",
      "https://pay.example.com",
    ],
  ])("strips the script path from a script served %s", (_case, current, base) => {
    expect(resolveScriptBase("/embed/v1.js", createDocument({ current }))).toBe(base)
  })

  test("looks through the page's scripts when the current one is unknown", () => {
    const doc = createDocument({
      scripts: ["https://cdn.example.com/app.js", "https://pay.example.com/modal/bitcart.js"],
    })

    expect(resolveScriptBase("/modal/bitcart.js", doc)).toBe("https://pay.example.com")
  })

  test("prefers the current script to others on the page", () => {
    const doc = createDocument({
      current: "https://a.example.com/embed/v1.js",
      scripts: ["https://b.example.com/embed/v1.js", "https://a.example.com/embed/v1.js"],
    })

    expect(resolveScriptBase("/embed/v1.js", doc)).toBe("https://a.example.com")
  })

  test.each([
    ["another script", "https://pay.example.com/embed/v2.js"],
    ["a script whose path only ends the same", "https://pay.example.com/my-embed/v1.js"],
    ["a script under that path", "https://pay.example.com/embed/v1.js/other.js"],
    ["an inline script", ""],
  ])("finds nothing in %s", (_case, current) => {
    expect(resolveScriptBase("/embed/v1.js", createDocument({ current }))).toBeNull()
  })
})

describe("stripTrailingSlashes", () => {
  test.each([
    ["https://pay.example.com//", "https://pay.example.com"],
    ["https://example.com/pay/", "https://example.com/pay"],
    ["https://pay.example.com", "https://pay.example.com"],
  ])("turns %s into %s", (url, stripped) => {
    expect(stripTrailingSlashes(url)).toBe(stripped)
  })
})
