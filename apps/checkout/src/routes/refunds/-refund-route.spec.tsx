import { QueryClient } from "@tanstack/react-query"
import { waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, test } from "vitest"

import { makeInvoice, makeRefund } from "#/checkout/fixtures"
import { serveCheckoutApi, setupCheckoutApiServer } from "#/checkout/testing/api-server"

import { Route } from "./$refundId"

const server = setupCheckoutApiServer()

const runLoader = (queryClient: QueryClient) => {
  const { loader } = Route.options

  if (typeof loader !== "function") {
    throw new Error("The refund route no longer declares its loader as a function")
  } else
    void loader({
      context: { queryClient },
      params: { refundId: "refund-1" },
    } as unknown as Parameters<typeof loader>[0])
}

describe("refund route loader", () => {
  test("prefetches the refund, then its invoice, the invoice's store and the policies", async () => {
    const api = serveCheckoutApi(makeInvoice({ store_id: "store-1" }))
    const queryClient = new QueryClient()

    runLoader(queryClient)

    await waitFor(() => expect(api.storeRequests).toStrictEqual(["store-1"]))
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))

    expect(api.refundRequests).toStrictEqual(["refund-1"])
    expect(api.invoiceRequests).toBe(1)
    expect(api.policiesRequests).toBe(1)
  })

  test("loads nothing else for a refund whose invoice was deleted", async () => {
    const api = serveCheckoutApi(makeInvoice())
    const queryClient = new QueryClient()

    server.use(
      http.get("*/invoices/refunds/:refundId", () =>
        HttpResponse.json(makeRefund({ invoice_id: null })),
      ),
    )

    runLoader(queryClient)

    await waitFor(() => expect(queryClient.isFetching()).toBe(0))

    expect(api.invoiceRequests).toBe(0)
    expect(api.policiesRequests).toBe(0)
  })
})
