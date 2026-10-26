import { QueryClient } from "@tanstack/react-query"
import { waitFor } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { makeInvoice } from "#/checkout/fixtures"
import { serveCheckoutApi, setupCheckoutApiServer } from "#/checkout/testing/api-server"
import { checkoutTemplates } from "#/common/checkout-templates"

import { Route } from "./$invoiceId_.receipt"

setupCheckoutApiServer()

describe("receipt route loader", () => {
  test("prefetches the invoice, its store, its refund and the policies, without a template", async () => {
    const api = serveCheckoutApi(makeInvoice({ store_id: "store-1", refund_id: "refund-1" }))
    const loadTemplate = vi.spyOn(checkoutTemplates, "load")
    const queryClient = new QueryClient()
    const { loader } = Route.options

    if (typeof loader !== "function") {
      throw new Error("The receipt route no longer declares its loader as a function")
    } else
      void loader({
        context: { queryClient },
        params: { invoiceId: "invoice-1" },
      } as unknown as Parameters<typeof loader>[0])

    await waitFor(() => expect(api.storeRequests).toStrictEqual(["store-1"]))
    await waitFor(() => expect(api.refundRequests).toStrictEqual(["refund-1"]))
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))

    expect(api.invoiceRequests).toBe(1)
    expect(api.policiesRequests).toBe(1)
    expect(loadTemplate).not.toHaveBeenCalled()
  })
})
