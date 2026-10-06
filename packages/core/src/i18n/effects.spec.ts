import { describe, expect, test } from "vitest"

import { combineLocaleLoaders } from "./effects"

describe("combineLocaleLoaders", () => {
  test("merges the catalogs, letting a later loader win on a shared id", async () => {
    const loadLocale = combineLocaleLoaders(
      (locale) => Promise.resolve({ shared: `package ${locale}`, package: "package" }),
      (locale) => Promise.resolve({ shared: `app ${locale}`, app: "app" }),
    )

    expect(await loadLocale("de")).toEqual({ shared: "app de", package: "package", app: "app" })
  })

  test("returns a fresh object rather than one of the loaded catalogs", async () => {
    const packageMessages = { package: "package" }
    const loadLocale = combineLocaleLoaders(() => Promise.resolve(packageMessages))

    expect(await loadLocale("de")).not.toBe(packageMessages)
  })
})
