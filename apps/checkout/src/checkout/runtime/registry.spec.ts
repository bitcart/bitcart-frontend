import { setupI18n, type Messages } from "@lingui/core"
import { describe, expect, test, vi } from "vitest"

import { defineCheckoutTemplate } from "../template"
import { createTemplateRegistry } from "./registry"

const Screen = () => null

const templateModule = (name: string) => () =>
  Promise.resolve({ default: defineCheckoutTemplate({ name: { id: name }, Payment: Screen }) })

describe("createTemplateRegistry", () => {
  test("lists template ids from their folder names without loading them", () => {
    const loadAccordion = vi.fn(templateModule("Accordion"))
    const loadSpotlight = vi.fn(templateModule("Spotlight"))

    const registry = createTemplateRegistry(
      {
        "../templates/accordion/index.ts": loadAccordion,
        "../templates/spotlight/index.ts": loadSpotlight,
      },
      { defaultId: "accordion" },
    )

    expect(registry.ids).toStrictEqual(["accordion", "spotlight"])
    expect(loadAccordion).not.toHaveBeenCalled()
    expect(loadSpotlight).not.toHaveBeenCalled()
  })

  test("loads a template with its defaults applied, once per id", async () => {
    const loadSpotlight = vi.fn(templateModule("Spotlight"))

    const registry = createTemplateRegistry(
      { "../templates/spotlight/index.ts": loadSpotlight },
      { defaultId: "spotlight" },
    )

    const [first, second] = [registry.load("spotlight"), registry.load("spotlight")]

    expect(first).toBe(second)

    await expect(first).resolves.toMatchObject({
      name: { id: "Spotlight" },
      selection: "preselect",
    })

    expect(loadSpotlight).toHaveBeenCalledOnce()
  })

  test("retries a template whose chunk failed to load", async () => {
    const loadSpotlight = vi
      .fn(templateModule("Spotlight"))
      .mockRejectedValueOnce(new Error("Failed to fetch dynamically imported module"))

    const registry = createTemplateRegistry(
      { "../templates/spotlight/index.ts": loadSpotlight },
      { defaultId: "spotlight" },
    )

    await expect(registry.load("spotlight")).rejects.toThrow(/Failed to fetch/u)
    await expect(registry.load("spotlight")).resolves.toMatchObject({ name: { id: "Spotlight" } })
  })

  test.each(["Accordion", "spot_light", "spot--light", "-spotlight"])(
    "rejects the folder name %j",
    (folder) => {
      expect(() =>
        createTemplateRegistry(
          { [`../templates/${folder}/index.ts`]: templateModule(folder) },
          { defaultId: folder },
        ),
      ).toThrow(/kebab-case/u)
    },
  )

  describe("resolve", () => {
    const registry = createTemplateRegistry(
      {
        "../templates/accordion/index.ts": templateModule("Accordion"),
        "../templates/spotlight/index.ts": templateModule("Spotlight"),
        "../templates/receipt/index.ts": templateModule("Receipt"),
      },
      { defaultId: "accordion" },
    )

    test.each([
      [{ requested: "spotlight", stored: "receipt", allowRequested: true }, "spotlight"],
      [{ requested: "spotlight", stored: "receipt", allowRequested: false }, "receipt"],
      [{ requested: "unknown", stored: "receipt", allowRequested: true }, "receipt"],
      [{ requested: undefined, stored: "unknown", allowRequested: true }, "accordion"],
      [{ requested: undefined, stored: null, allowRequested: false }, "accordion"],
    ])("resolves %o to %j", (params, expected) => {
      expect(registry.resolve(params)).toBe(expected)
    })
  })

  test("requires the default template to be registered", () => {
    expect(() =>
      createTemplateRegistry(
        { "../templates/spotlight/index.ts": templateModule("Spotlight") },
        { defaultId: "accordion" },
      ),
    ).toThrow(/accordion/u)
  })

  describe("catalogs", () => {
    const catalogModule = (messages: Messages) => () => Promise.resolve({ messages })

    const setup = (catalogs: Record<string, () => Promise<{ messages: Messages }>>) => {
      const i18n = setupI18n({ locale: "de", messages: { de: { "app.title": "Kasse" } } })

      const registry = createTemplateRegistry(
        { "../templates/accordion/index.ts": templateModule("Accordion") },
        { defaultId: "accordion", catalogs, i18n },
      )

      return { i18n, registry }
    }

    test("merges the template's catalog for a locale into the app's translations", async () => {
      const { i18n, registry } = setup({
        "../templates/accordion/locales/de.po": catalogModule({ "accordion.pay": "Bezahlen" }),
      })

      await registry.loadCatalog("accordion", "de")

      expect(i18n._("accordion.pay")).toBe("Bezahlen")
      expect(i18n._("app.title")).toBe("Kasse")
    })

    test("degrades a catalog that fails to load to the source messages the template ships", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined)

      const i18n = setupI18n({ locale: "de", messages: { de: {} } })

      const registry = createTemplateRegistry(
        {
          "../templates/accordion/index.ts": () =>
            Promise.resolve({
              default: defineCheckoutTemplate({
                name: { id: "Accordion" },
                Payment: Screen,
                sourceMessages: { "accordion.pay": "Pay" },
              }),
            }),
        },
        {
          defaultId: "accordion",
          i18n,

          catalogs: {
            "../templates/accordion/locales/de.po": () =>
              Promise.reject(new Error("Failed to fetch dynamically imported module")),
          },
        },
      )

      await registry.settleCatalog("accordion", "de")

      expect(i18n._("accordion.pay")).toBe("Pay")
      expect(registry.isCatalogSettled("accordion", "de")).toBe(true)
    })

    test.each(["en", "ko"])(
      "loads the source messages the template ships for %s, which has no lazy catalog",
      async (locale) => {
        const i18n = setupI18n({ locale: "de", messages: { de: {} } })

        const registry = createTemplateRegistry(
          {
            "../templates/accordion/index.ts": () =>
              Promise.resolve({
                default: defineCheckoutTemplate({
                  name: { id: "Accordion" },
                  Payment: Screen,
                  sourceMessages: { "accordion.pay": "Pay" },
                }),
              }),
          },
          { defaultId: "accordion", i18n },
        )

        await registry.loadCatalog("accordion", locale)
        i18n.activate(locale)

        expect(i18n._("accordion.pay")).toBe("Pay")
      },
    )

    test("loads each catalog once, and again after a failed load", async () => {
      const loadGerman = vi
        .fn(catalogModule({ "accordion.pay": "Bezahlen" }))
        .mockRejectedValueOnce(new Error("Failed to fetch dynamically imported module"))

      const { registry } = setup({ "../templates/accordion/locales/de.po": loadGerman })

      await expect(registry.loadCatalog("accordion", "de")).rejects.toThrow(/Failed to fetch/u)

      const [first, second] = [
        registry.loadCatalog("accordion", "de"),
        registry.loadCatalog("accordion", "de"),
      ]

      expect(first).toBe(second)
      await first
      expect(loadGerman).toHaveBeenCalledTimes(2)
    })
  })
})
