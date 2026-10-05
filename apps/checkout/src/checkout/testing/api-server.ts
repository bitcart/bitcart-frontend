import { BitcartApiConfig } from "@bitcart/api-sdk/config"
import type { bitcartInvoices } from "@bitcart/api-sdk/endpoints"
import {
  getInvoicesGetItemMockHandler,
  getInvoicesUpdateInvoiceMockHandler,
  getManageSetPoliciesResponseMock,
  getStoresGetItemMockHandler,
} from "@bitcart/api-sdk/mocks"
import { http, HttpResponse, ws, type WebSocketHandlerConnection } from "msw"
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll } from "vitest"

import { makeStore } from "../fixtures"

//! Not part of `#/checkout/testing`: templates never talk to the API, so only core and app tests
//! import this module.

const API_URL = "http://api.test"

const server = setupServer()

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
 * Serves one invoice with its store and the server policies. Customer updates write to the
 * invoice, a test may replace it or hold its responses back, and the returned object records every
 * request and websocket client.
 */
export const serveCheckoutApi = (initialInvoice: bitcartInvoices.Invoice) => {
  const api = {
    invoice: initialInvoice,
    invoiceResponseGate: null as Promise<void> | null,
    invoiceRequests: 0,
    storeRequests: [] as string[],
    policiesRequests: 0,
    customerUpdates: [] as unknown[],
    sockets: [] as WebSocketHandlerConnection["client"][],
  }

  const invoiceSocket = ws.link(`${API_URL.replace(/^http/u, "ws")}/ws/invoices/:invoiceId`)

  server.use(
    getInvoicesGetItemMockHandler(async () => {
      api.invoiceRequests += 1
      await api.invoiceResponseGate

      return api.invoice
    }),

    getStoresGetItemMockHandler(({ params }) => {
      api.storeRequests.push(String(params.modelId))

      return makeStore({ email_required: true })
    }),

    //* The schema types this response as `unknown`, so the generated handler always sends no body.
    http.get("*/manage/policies", () => {
      api.policiesRequests += 1

      return HttpResponse.json(getManageSetPoliciesResponseMock({ allow_powered_by_bitcart: true }))
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
