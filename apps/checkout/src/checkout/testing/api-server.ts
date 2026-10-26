import { BitcartApiConfig } from "@bitcart/client-sdk/config"
import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import {
  getInvoicesGetItemMockHandler,
  getInvoicesGetRefundMockHandler,
  getInvoicesUpdateInvoiceMockHandler,
  getManageGetPoliciesMockHandler,
  getManageGetPoliciesResponseMock,
  getStoresGetItemMockHandler,
} from "@bitcart/client-sdk/mocks"
import { http, HttpResponse, ws, type WebSocketHandlerConnection } from "msw"
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll } from "vitest"

import { makeRefund, makeStore } from "../fixtures"

//! Not part of `#/checkout/testing`: templates never talk to the API, so only core and app tests
//! import this module.

const API_URL = "http://api.test"

const server = setupServer()

//! Created once: every link adds a listener to a channel MSW shares across links and never frees.
const invoiceSocket = ws.link(`${API_URL.replace(/^http/u, "ws")}/ws/invoices/:invoiceId`)

/**
 * Points the SDK at a mock API for the calling test file, and fails every request it does not
 * serve.
 */
export const setupCheckoutApiServer = () => {
  beforeAll(() => {
    BitcartApiConfig.set({ baseUrl: API_URL })
    server.listen({ onUnhandledFrame: "error" })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  return server
}

/**
 * Serves one invoice with its store, its refund and the server policies. Customer updates write to
 * the invoice, a test may replace it, delete it or hold its responses back, and the returned
 * object records every request and websocket client.
 */
export const serveCheckoutApi = (initialInvoice: bitcartInvoices.Invoice) => {
  const api = {
    invoice: initialInvoice,
    isInvoiceNotFound: false,
    invoiceResponseGate: null as Promise<void> | null,
    invoiceRequests: 0,
    storeRequests: [] as string[],
    refundRequests: [] as string[],
    policiesRequests: 0,
    customerUpdates: [] as unknown[],
    sockets: [] as WebSocketHandlerConnection["client"][],
  }

  //* Registered ahead of the generated handler, which only answers 200.
  const notFoundInvoiceHandler = http.get("*/invoices/:itemId", async () => {
    if (!api.isInvoiceNotFound) return undefined

    api.invoiceRequests += 1
    await api.invoiceResponseGate

    return HttpResponse.json({ detail: "Invoice does not exist!" }, { status: 404 })
  })

  server.use(
    notFoundInvoiceHandler,

    getInvoicesGetItemMockHandler(async () => {
      api.invoiceRequests += 1
      await api.invoiceResponseGate

      return api.invoice
    }),

    getStoresGetItemMockHandler(({ params }) => {
      api.storeRequests.push(String(params.modelId))

      return makeStore({ email_required: true })
    }),

    getInvoicesGetRefundMockHandler(({ params }) => {
      api.refundRequests.push(String(params.refundId))

      return makeRefund({ id: String(params.refundId) })
    }),

    getManageGetPoliciesMockHandler(() => {
      api.policiesRequests += 1

      return { ...getManageGetPoliciesResponseMock(), allow_powered_by_bitcart: true }
    }),

    getInvoicesUpdateInvoiceMockHandler(async ({ request }) => {
      const update = (await request.json()) as Partial<bitcartInvoices.Invoice>

      api.customerUpdates.push(update)
      api.invoice = { ...api.invoice, ...update }

      return api.invoice
    }),

    invoiceSocket.addEventListener("connection", ({ client }) => {
      api.sockets.push(client)
    }),
  )

  return api
}
