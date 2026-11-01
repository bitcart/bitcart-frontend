import { setupI18n } from "@lingui/core"
import { describe, expect, test, vi } from "vitest"

import { createLocaleActivation } from "./activation"

const setup = () => {
  const i18n = setupI18n()

  const loadAppMessages = vi.fn((locale: string) =>
    Promise.resolve({ "app.title": `App (${locale})` }),
  )

  const activation = createLocaleActivation({
    i18n,

    catalogs: [
      {
        sourceMessages: { "kit.close": "Close", "app.title": "Package title" },
        loadMessages: (locale) => Promise.resolve({ "kit.close": `Close (${locale})` }),
      },

      { sourceMessages: { "app.title": "App" }, loadMessages: loadAppMessages },
    ],
  })

  activation.activateSourceLocale()

  return { i18n, loadAppMessages, ...activation }
}

describe("createLocaleActivation", () => {
  test("activates the source catalogs merged in order, later ones overriding earlier ones", () => {
    const { i18n, loadAppMessages } = setup()

    expect(i18n.locale).toBe("en")
    expect(i18n._("kit.close")).toBe("Close")
    expect(i18n._("app.title")).toBe("App")
    expect(loadAppMessages).not.toHaveBeenCalled()
  })

  test("activates a locale with every catalog, keeping catalogs merged into it earlier", async () => {
    const { i18n, activateLocale } = setup()

    i18n.load("de", { "flow.pay": "Bezahlen" })
    await activateLocale("de")

    expect(i18n.locale).toBe("de")
    expect(i18n._("kit.close")).toBe("Close (de)")
    expect(i18n._("app.title")).toBe("App (de)")
    expect(i18n._("flow.pay")).toBe("Bezahlen")
  })

  test("switches back to the source locale without loading its catalogs", async () => {
    const { i18n, activateLocale, loadAppMessages } = setup()

    await activateLocale("de")
    await activateLocale("en")

    expect(i18n.locale).toBe("en")
    expect(i18n._("app.title")).toBe("App")
    expect(loadAppMessages).toHaveBeenCalledExactlyOnceWith("de")
  })

  test("does nothing for the active locale", async () => {
    const { activateLocale, loadAppMessages } = setup()

    await activateLocale("de")
    await activateLocale("de")

    expect(loadAppMessages).toHaveBeenCalledOnce()
  })

  test("switches only once every registered catalog for the locale has loaded", async () => {
    const { i18n, activateLocale, registerCatalogLoader } = setup()
    const templateCatalog = Promise.withResolvers<void>()

    registerCatalogLoader((locale) =>
      templateCatalog.promise.then(() => i18n.load(locale, { "flow.pay": "Bezahlen" })),
    )

    const activation = activateLocale("de")

    await Promise.resolve()
    expect(i18n.locale).toBe("en")

    templateCatalog.resolve()
    await activation

    expect(i18n.locale).toBe("de")
    expect(i18n._("flow.pay")).toBe("Bezahlen")
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
