import { bitcartInvoices, bitcartManage, bitcartStores } from "@bitcart/api-sdk/endpoints"
import type { RuntimeEnvTag } from "@bitcart/core/types"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Suspense } from "react"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { useCheckoutSource } from "#/checkout/runtime/source"
import { serveCheckoutApi, setupCheckoutApiServer } from "#/checkout/testing/api-server"
import { makeInvoice } from "#/checkout/testing/fixtures"
import { checkoutTemplates } from "#/common/checkout-templates"

import { Route } from "./$invoiceId"

const env = vi.hoisted(() => ({ tag: "development" as RuntimeEnvTag }))

vi.mock("#/common/constants", async (importOriginal) => ({
  ...(await importOriginal<typeof import("#/common/constants")>()),

  get ENV_TAG() {
    return env.tag
  },
}))

const server = setupCheckoutApiServer()

//* The loader reads only these three fields; the router supplies the rest.
const runLoader = (queryClient: QueryClient, { template }: { template?: string } = {}) => {
  const { loader } = Route.options

  if (typeof loader !== "function") {
    throw new Error("The invoice route no longer declares its loader as a function")
  } else
    return loader({
      context: { queryClient },
      params: { invoiceId: "invoice-1" },
      deps: { template },
    } as unknown as Parameters<typeof loader>[0])
}

const waitForPrefetches = (queryClient: QueryClient) =>
  waitFor(() => expect(queryClient.isFetching()).toBe(0))

beforeEach(() => {
  env.tag = "development"
})

describe("invoice route loader", () => {
  test("starts the invoice, policies and template loads at once, and the store once the invoice names it", async () => {
    const api = serveCheckoutApi(makeInvoice({ store_id: "store-1" }))
    const invoiceResponse = Promise.withResolvers<void>()
    const loadTemplate = vi.spyOn(checkoutTemplates, "load")
    const queryClient = new QueryClient()

    api.invoiceResponseGate = invoiceResponse.promise

    expect(runLoader(queryClient)).toBeUndefined()

    await waitFor(() => expect(api.invoiceRequests).toBe(1))
    await waitFor(() => expect(api.policiesRequests).toBe(1))
    expect(loadTemplate).toHaveBeenCalledWith(checkoutTemplates.defaultId)
    expect(api.storeRequests).toStrictEqual([])

    invoiceResponse.resolve()

    await waitFor(() => expect(api.storeRequests).toStrictEqual(["store-1"]))
  })

  test("prefetches into the queries the page reads, so the page requests nothing again", async () => {
    const api = serveCheckoutApi(makeInvoice({ status: "complete" }))
    const queryClient = new QueryClient()

    runLoader(queryClient)
    await waitFor(() => expect(api.storeRequests).toHaveLength(1))
    await waitForPrefetches(queryClient)

    const { result } = renderHook(() => useCheckoutSource("invoice-1"), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>{children}</Suspense>
        </QueryClientProvider>
      ),
    })

    await waitFor(() => expect(result.current).not.toBeNull())

    expect(api.invoiceRequests).toBe(1)
    expect(api.storeRequests).toHaveLength(1)
    expect(api.policiesRequests).toBe(1)
  })

  test("skips the store for an invoice without one", async () => {
    const api = serveCheckoutApi(makeInvoice({ store_id: null }))
    const queryClient = new QueryClient()

    runLoader(queryClient)
    await waitFor(() => expect(api.invoiceRequests).toBe(1))
    await waitForPrefetches(queryClient)

    expect(api.storeRequests).toStrictEqual([])
    expect(api.policiesRequests).toBe(1)
  })

  test.each([
    ["invoice", "*/invoices/:itemId", () => bitcartInvoices.invoiceQueryOptions("invoice-1")],
    ["store", "*/stores/:modelId", () => bitcartStores.storeQueryOptions("store-1")],
    ["policies", "*/manage/policies", () => bitcartManage.policiesQueryOptions()],
  ] as const)(
    "leaves a failed %s load to the page, without throwing or rejecting",
    async (_name, path, getQueryOptions) => {
      serveCheckoutApi(makeInvoice({ store_id: "store-1" }))
      server.use(http.get(path, () => new HttpResponse(null, { status: 500 })))
      vi.spyOn(checkoutTemplates, "load").mockRejectedValue(new Error("Chunk failed to load"))
      const queryClient = new QueryClient()

      expect(() => runLoader(queryClient)).not.toThrow()

      await waitFor(() =>
        expect(queryClient.getQueryState(getQueryOptions().queryKey)?.status).toBe("error"),
      )

      await waitForPrefetches(queryClient)
    },
  )

  describe("template", () => {
    test.each([
      ["development", "spotlight", "spotlight"],
      ["development", "no-such-template", checkoutTemplates.defaultId],
      ["production", "spotlight", checkoutTemplates.defaultId],
    ] as const)("in %s, `?template=%s` loads %s", async (envTag, requested, loaded) => {
      serveCheckoutApi(makeInvoice())
      env.tag = envTag
      const loadTemplate = vi.spyOn(checkoutTemplates, "load")
      const queryClient = new QueryClient()

      runLoader(queryClient, { template: requested })

      expect(loadTemplate).toHaveBeenCalledWith(loaded)

      await waitForPrefetches(queryClient)
    })
  })
})
