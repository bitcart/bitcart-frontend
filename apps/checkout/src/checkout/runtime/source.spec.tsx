import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, screen, waitFor } from "@testing-library/react"
import { Component, Suspense, type ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { serveCheckoutApi, setupCheckoutApiServer } from "../testing/api-server"
import { makeInvoice } from "../testing/fixtures"
import { useCheckoutSource } from "./source"

const INVOICE_REFETCH_INTERVAL_MS = 30_000

setupCheckoutApiServer()

class ErrorCatcher extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  override render() {
    return this.state.error ? <p role="alert">{String(this.state.error)}</p> : this.props.children
  }
}

const renderSource = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return renderHook(() => useCheckoutSource("invoice-1"), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ErrorCatcher>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorCatcher>
      </QueryClientProvider>
    ),
  })
}

const waitForSource = async (result: { current: ReturnType<typeof useCheckoutSource> | null }) => {
  await waitFor(() => expect(result.current).not.toBeNull())

  return () => result.current as ReturnType<typeof useCheckoutSource>
}

//* Connecting refetches the invoice, so an open invoice is requested twice before anything else.
const waitForLiveInvoice = async (
  api: ReturnType<typeof serveCheckoutApi>,
  current: () => ReturnType<typeof useCheckoutSource>,
) => {
  await waitFor(() => expect(current().connection.isConnected).toBe(true))
  await waitFor(() => expect(api.invoiceRequests).toBe(2))
}

const advanceTime = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe("useCheckoutSource", () => {
  test("loads the invoice, then the invoice's store and the server policies", async () => {
    const api = serveCheckoutApi(makeInvoice({ store_id: "store-1" }))
    const { result } = renderSource()
    const current = await waitForSource(result)

    expect(current().source.invoice.id).toBe("invoice-1")
    expect(current().source.store.name).toBe("Example Store")
    expect(current().source.policies.allow_powered_by_bitcart).toBe(true)
    expect(api.storeRequests).toStrictEqual(["store-1"])
  })

  test("reports an invoice without a store as malformed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    serveCheckoutApi(makeInvoice({ store_id: null }))

    renderSource()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invoice invoice-1 is not associated with a store",
    )
  })

  test("saves customer details, then refetches the invoice that now carries them", async () => {
    const api = serveCheckoutApi(makeInvoice({ buyer_email: "" }))
    const { result } = renderSource()
    const current = await waitForSource(result)

    await act(() => current().source.submitCustomerDetails({ buyer_email: "buyer@example.com" }))

    expect(api.customerUpdates).toStrictEqual([{ buyer_email: "buyer@example.com" }])

    //* The query cache notifies subscribers on a later tick than the refetch resolves.
    await waitFor(() => expect(current().source.invoice.buyer_email).toBe("buyer@example.com"))
  })

  test("refetches the invoice when its websocket reports a change", async () => {
    const api = serveCheckoutApi(makeInvoice({ status: "pending" }))
    const { result } = renderSource()
    const current = await waitForSource(result)

    await waitForLiveInvoice(api, current)

    api.invoice = { ...api.invoice, status: "paid" }

    for (const socket of api.sockets) {
      socket.send(JSON.stringify({ status: "paid", exception_status: "none" }))
    }

    await waitFor(() => expect(current().source.invoice.status).toBe("paid"))
    expect(api.invoiceRequests).toBe(3)
  })

  describe("polling", () => {
    //* Only intervals are faked, and their clock also follows real time: `waitFor` checks on an
    //* interval too, and a frozen one never lets it retry.
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"], shouldAdvanceTime: true })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test("refetches an open invoice every 30 seconds", async () => {
      const api = serveCheckoutApi(makeInvoice({ status: "pending" }))
      const { result } = renderSource()
      const current = await waitForSource(result)

      await waitForLiveInvoice(api, current)
      advanceTime(INVOICE_REFETCH_INTERVAL_MS / 2)

      expect(api.invoiceRequests).toBe(2)

      advanceTime(INVOICE_REFETCH_INTERVAL_MS / 2)
      await waitFor(() => expect(api.invoiceRequests).toBe(3))

      advanceTime(INVOICE_REFETCH_INTERVAL_MS)
      await waitFor(() => expect(api.invoiceRequests).toBe(4))
    })

    test("stops polling once a refetch finds the invoice in a final status", async () => {
      const api = serveCheckoutApi(makeInvoice({ status: "pending" }))
      const { result } = renderSource()
      const current = await waitForSource(result)

      await waitForLiveInvoice(api, current)

      api.invoice = { ...api.invoice, status: "complete" }

      advanceTime(INVOICE_REFETCH_INTERVAL_MS)
      await waitFor(() => expect(current().source.invoice.status).toBe("complete"))
      advanceTime(INVOICE_REFETCH_INTERVAL_MS * 3)

      expect(api.invoiceRequests).toBe(3)
    })

    test("never polls an invoice that is already in a final status", async () => {
      const api = serveCheckoutApi(makeInvoice({ status: "complete" }))
      const { result } = renderSource()

      await waitForSource(result)
      advanceTime(INVOICE_REFETCH_INTERVAL_MS * 3)

      expect(api.invoiceRequests).toBe(1)
      expect(api.sockets).toHaveLength(0)
    })
  })
})
