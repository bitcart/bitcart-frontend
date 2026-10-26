import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { Component, Suspense, type ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { makeInvoice, makePayment, makeRefund } from "../fixtures"
import { serveCheckoutApi, setupCheckoutApiServer } from "../testing/api-server"
import { useCheckoutSource, useRefundSource } from "./source"

const INVOICE_REFETCH_INTERVAL_MS = 30_000

const server = setupCheckoutApiServer()

class ErrorCatcher extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  override render() {
    return this.state.error ? <p role="alert">{String(this.state.error)}</p> : this.props.children
  }
}

const renderSuspendingHook = <TResult,>(hook: () => TResult) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  return renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ErrorCatcher>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorCatcher>
      </QueryClientProvider>
    ),
  })
}

const renderSource = () => renderSuspendingHook(() => useCheckoutSource("invoice-1"))

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

const waitForStrayRefetch = () => act(() => new Promise((resolve) => setTimeout(resolve, 100)))

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

  test("loads the invoice's refund", async () => {
    const api = serveCheckoutApi(makeInvoice({ refund_id: "refund-1" }))
    const { result } = renderSource()
    const current = await waitForSource(result)

    expect(current().source.refund?.id).toBe("refund-1")
    expect(api.refundRequests).toStrictEqual(["refund-1"])
  })

  test("leaves the refund out for an invoice without one", async () => {
    const api = serveCheckoutApi(makeInvoice())
    const { result } = renderSource()
    const current = await waitForSource(result)

    expect(current().source.refund).toBeUndefined()
    expect(api.refundRequests).toStrictEqual([])
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

  describe("sender address", () => {
    const SENDER = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"

    const eth = makePayment({
      id: "method-eth",
      wallet: { network: "eip155:1", sender_address_required: true, links: [] },
    })

    const serveAddressedInvoice = (
      respond: (api: ReturnType<typeof serveCheckoutApi>) => Response,
    ) => {
      const api = serveCheckoutApi(makeInvoice({ payments: [eth] }))
      const updates: unknown[] = []

      server.use(
        http.patch("*/invoices/:invoiceId/details", async ({ request }) => {
          updates.push(await request.json())

          return respond(api)
        }),
      )

      return { api, updates }
    }

    const setUserAddress = (api: ReturnType<typeof serveCheckoutApi>, userAddress: string) => {
      api.invoice = { ...api.invoice, payments: [{ ...eth, user_address: userAddress }] }
    }

    const rejection = () => HttpResponse.json({ detail: "Invalid address" }, { status: 422 })

    test("saves the address, then refetches the invoice that now carries it", async () => {
      const { updates } = serveAddressedInvoice((api) => {
        setUserAddress(api, SENDER)

        return HttpResponse.json(true)
      })

      const { result } = renderSource()
      const current = await waitForSource(result)

      await expect(
        act(() => current().source.submitSenderAddress("method-eth", SENDER)),
      ).resolves.toBe("accepted")

      expect(updates).toStrictEqual([{ id: "method-eth", address: SENDER }])

      await waitFor(() => expect(current().source.invoice.payments[0]?.user_address).toBe(SENDER))
    })

    test("reports an address the API rejects, after checking the invoice still asks for it", async () => {
      const { api } = serveAddressedInvoice(rejection)
      const { result } = renderSource()
      const current = await waitForSource(result)
      const requestsBefore = api.invoiceRequests

      await expect(current().source.submitSenderAddress("method-eth", "0xbad")).resolves.toBe(
        "rejected",
      )

      expect(api.invoiceRequests).toBe(requestsBefore + 1)
    })

    test.each([
      [
        "was given an address meanwhile",
        (api: ReturnType<typeof serveCheckoutApi>) => setUserAddress(api, SENDER),
      ],

      [
        "is no longer open",
        (api: ReturnType<typeof serveCheckoutApi>) => {
          api.invoice = { ...api.invoice, status: "expired" }
        },
      ],
    ])(
      "accepts a rejection for an invoice that %s, and shows it as it now is",
      async (_case, change) => {
        const { api } = serveAddressedInvoice((served) => {
          change(served)

          return rejection()
        })

        const { result } = renderSource()
        const current = await waitForSource(result)

        await expect(current().source.submitSenderAddress("method-eth", SENDER)).resolves.toBe(
          "accepted",
        )

        await waitFor(() => expect(current().source.invoice).toStrictEqual(api.invoice))
      },
    )

    test("throws any other failure for the form to report", async () => {
      const { api } = serveAddressedInvoice(() =>
        HttpResponse.json({ detail: "Internal Server Error" }, { status: 500 }),
      )

      const { result } = renderSource()
      const current = await waitForSource(result)
      const requestsBefore = api.invoiceRequests

      await expect(current().source.submitSenderAddress("method-eth", SENDER)).rejects.toThrow()
      expect(api.invoiceRequests).toBe(requestsBefore)
    })
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

  test("reports an invoice deleted while its checkout is open", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    const api = serveCheckoutApi(makeInvoice({ status: "pending" }))
    const { result } = renderSource()
    const current = await waitForSource(result)

    await waitForLiveInvoice(api, current)

    api.isInvoiceNotFound = true

    for (const socket of api.sockets) {
      socket.send(JSON.stringify({ status: "pending", exception_status: "none" }))
    }

    expect(await screen.findByRole("alert")).toHaveTextContent("Invoice does not exist!")
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
      await waitForStrayRefetch()

      expect(api.invoiceRequests).toBe(3)
    })

    test("never polls an invoice that is already in a final status", async () => {
      const api = serveCheckoutApi(makeInvoice({ status: "complete" }))
      const { result } = renderSource()

      await waitForSource(result)
      advanceTime(INVOICE_REFETCH_INTERVAL_MS * 3)
      await waitForStrayRefetch()

      expect(api.invoiceRequests).toBe(1)
      expect(api.sockets).toHaveLength(0)
    })
  })
})

describe("useRefundSource", () => {
  const REFUND_REFETCH_INTERVAL_MS = 30_000

  const serveRefund = (initialRefund: bitcartInvoices.InvoiceRefund) => {
    const api = {
      refund: initialRefund,
      refundRequests: 0,
      submissions: [] as unknown[],
      submitResponse: null as Response | null,
    }

    server.use(
      http.get("*/invoices/refunds/:refundId", () => {
        api.refundRequests += 1

        return HttpResponse.json(api.refund)
      }),

      http.post("*/invoices/refunds/:refundId/submit", async ({ request }) => {
        api.submissions.push(await request.json())

        return api.submitResponse ?? HttpResponse.json({ ...api.refund, payout_id: "payout-1" })
      }),
    )

    return api
  }

  const rejection = () =>
    HttpResponse.json({ detail: "Invalid destination address" }, { status: 422 })

  const renderRefundSource = async () => {
    const { result } = renderSuspendingHook(() => useRefundSource("refund-1"))

    await waitFor(() => expect(result.current).not.toBeNull())

    return () => result.current as ReturnType<typeof useRefundSource>
  }

  test("submits the address, and shows the refund the API returns", async () => {
    const api = serveRefund(makeRefund())
    const current = await renderRefundSource()

    api.submitResponse = HttpResponse.json(
      makeRefund({ payout_id: "payout-1", payout_status: "pending", destination: "bc1qbuyer" }),
    )

    await expect(current().submit("bc1qbuyer")).resolves.toBe("accepted")

    expect(api.submissions).toStrictEqual([{ destination: "bc1qbuyer" }])
    await waitFor(() => expect(current().refund.destination).toBe("bc1qbuyer"))
    expect(api.refundRequests).toBe(1)
  })

  test("reports an address the API rejects, after checking the refund is still open", async () => {
    const api = serveRefund(makeRefund())
    const current = await renderRefundSource()

    api.submitResponse = rejection()

    await expect(current().submit("not-an-address")).resolves.toBe("rejected")
    expect(api.refundRequests).toBe(2)
  })

  test.each([
    ["submitted meanwhile", { payout_id: "payout-1", payout_status: "pending" }],
    ["left without its invoice", { invoice_id: null }],
  ] as const)(
    "accepts a rejection of a refund %s, and shows it as it now is",
    async (_case, change) => {
      const api = serveRefund(makeRefund())
      const current = await renderRefundSource()

      api.submitResponse = rejection()
      api.refund = { ...api.refund, ...change }

      await expect(current().submit("bc1qbuyer")).resolves.toBe("accepted")
      await waitFor(() => expect(current().refund).toMatchObject(change))
    },
  )

  test("throws any other failure for the form to report", async () => {
    const api = serveRefund(makeRefund())
    const current = await renderRefundSource()

    api.submitResponse = HttpResponse.json({ detail: "Internal Server Error" }, { status: 500 })

    await expect(current().submit("bc1qbuyer")).rejects.toThrow()
    expect(api.refundRequests).toBe(1)
  })

  describe("polling", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"], shouldAdvanceTime: true })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test("refetches a refund the store has yet to send every 30 seconds", async () => {
      const api = serveRefund(makeRefund({ payout_id: "payout-1", payout_status: "approved" }))

      await renderRefundSource()
      advanceTime(REFUND_REFETCH_INTERVAL_MS)
      await waitFor(() => expect(api.refundRequests).toBe(2))
    })

    test.each([null, "complete", "cancelled"])(
      "never polls a refund whose payout is %s",
      async (payout_status) => {
        const api = serveRefund(makeRefund({ payout_status }))

        await renderRefundSource()
        advanceTime(REFUND_REFETCH_INTERVAL_MS * 3)

        await waitForStrayRefetch()

        expect(api.refundRequests).toBe(1)
      },
    )
  })
})
