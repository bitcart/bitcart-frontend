import { describe, expect, test } from "vitest"

import { checkoutTemplates, DEFAULT_CHECKOUT_TEMPLATE_ID } from "./checkout-templates"

const TEMPLATE_IMPORT_TIMEOUT_MS = 30_000

describe("checkoutTemplates", () => {
  test("registers the default template", () => {
    expect(checkoutTemplates.ids).toContain(DEFAULT_CHECKOUT_TEMPLATE_ID)
  })

  //* The first import of a template transforms its whole module tree, which exceeds the default
  //* timeout when the suite runs in parallel.
  test.each(checkoutTemplates.ids)(
    "loads %s as a checkout template",
    async (id) => {
      await expect(checkoutTemplates.load(id)).resolves.toMatchObject({
        name: { id: expect.any(String) },
        Payment: expect.any(Function),
      })
    },
    TEMPLATE_IMPORT_TIMEOUT_MS,
  )
})
