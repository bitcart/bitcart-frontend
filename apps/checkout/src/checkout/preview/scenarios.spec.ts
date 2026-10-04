import { DisplayInvoice, Policy, PublicStore } from "@bitcart/api-sdk/schemas"
import { CHECKOUT_PREVIEW_STATUSES } from "@bitcart/qa"
import { describe, expect, test } from "vitest"

import { CHECKOUT_PREVIEW_SCENARIOS } from "./scenarios"

describe("checkout preview scenarios", () => {
  test("cover every preview status", () => {
    expect(Object.keys(CHECKOUT_PREVIEW_SCENARIOS)).toStrictEqual([...CHECKOUT_PREVIEW_STATUSES])
  })

  describe.each(CHECKOUT_PREVIEW_STATUSES)("the %s scenario", (status) => {
    const { invoice, store, policies } = CHECKOUT_PREVIEW_SCENARIOS[status]

    test("is an invoice the API could return", () => {
      expect(DisplayInvoice.safeParse(invoice).error).toBeUndefined()
    })

    test("is a store the API could return", () => {
      expect(PublicStore.safeParse(store).error).toBeUndefined()
    })

    test("is a policy set the API could return", () => {
      expect(Policy.safeParse(policies).error).toBeUndefined()
    })
  })
})
