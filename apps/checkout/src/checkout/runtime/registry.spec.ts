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
})
