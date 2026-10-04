import { setupI18n } from "@lingui/core"
import { describe, expect, test } from "vitest"

import { createLocaleActivation } from "./activation"

const setup = () => {
  const i18n = setupI18n({ locale: "en", messages: { en: {} } })

  const activation = createLocaleActivation({
    i18n,
    loadAppCatalog: (locale) => Promise.resolve({ "app.title": `Checkout (${locale})` }),
  })

  return { i18n, ...activation }
}

describe("createLocaleActivation", () => {
  test("activates a locale with the app's catalog, keeping catalogs merged into it earlier", async () => {
    const { i18n, activateLocale } = setup()

    i18n.load("de", { "accordion.pay": "Bezahlen" })
    await activateLocale("de")

    expect(i18n.locale).toBe("de")
    expect(i18n._("app.title")).toBe("Checkout (de)")
    expect(i18n._("accordion.pay")).toBe("Bezahlen")
  })

  test("switches only once every registered catalog for the locale has loaded", async () => {
    const { i18n, activateLocale, registerCatalogLoader } = setup()
    const templateCatalog = Promise.withResolvers<void>()

    registerCatalogLoader((locale) =>
      templateCatalog.promise.then(() => i18n.load(locale, { "accordion.pay": "Bezahlen" })),
    )

    const activation = activateLocale("de")

    await Promise.resolve()
    expect(i18n.locale).toBe("en")

    templateCatalog.resolve()
    await activation

    expect(i18n.locale).toBe("de")
    expect(i18n._("accordion.pay")).toBe("Bezahlen")
  })

  test("stops waiting for a catalog loader once it is unregistered", async () => {
    const { i18n, activateLocale, registerCatalogLoader } = setup()
    const unregister = registerCatalogLoader(() => new Promise(() => undefined))

    unregister()
    await activateLocale("de")

    expect(i18n.locale).toBe("de")
  })

  test("switches even when a registered catalog fails to load, leaving the retry to its owner", async () => {
    const { i18n, activateLocale, registerCatalogLoader } = setup()

    registerCatalogLoader(() =>
      Promise.reject(new Error("Failed to fetch dynamically imported module")),
    )

    await activateLocale("de")

    expect(i18n.locale).toBe("de")
  })
})
