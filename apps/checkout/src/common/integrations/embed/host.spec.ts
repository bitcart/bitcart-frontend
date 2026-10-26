import { onTestFinished, describe, expect, test, vi } from "vitest"

import { makeInvoice } from "#/checkout/fixtures"

import { createEmbedHost } from "./host"
import type { EmbedFrameMessage } from "./protocol"

const REDIRECT_URL = "https://shop.example.com/thanks"

const createFrame = () => {
  const parent = { postMessage: vi.fn() }
  const frame = Object.assign(new EventTarget(), { parent })

  const deliver = (
    data: unknown,
    { source = parent as unknown, ports = [] as MessagePort[] } = {},
  ) => frame.dispatchEvent(Object.assign(new Event("message"), { data, source, ports }))

  return { frame: frame as unknown as Window, parent, deliver }
}

describe("createEmbedHost", () => {
  const setup = () => {
    const { frame, parent, deliver } = createFrame()
    const host = createEmbedHost(frame)
    const received: EmbedFrameMessage[] = []

    const connect = (
      options: { source?: unknown; data?: unknown } = {},
      into: EmbedFrameMessage[] = received,
    ) => {
      const channel = new MessageChannel()

      channel.port1.onmessage = ({ data }: MessageEvent<EmbedFrameMessage>) => into.push(data)
      onTestFinished(() => channel.port1.close())

      deliver(options.data ?? { v: 1, type: "connect" }, {
        source: options.source ?? parent,
        ports: [channel.port2],
      })
    }

    const types = () => received.map(({ type }) => type)

    return { host, parent, connect, received, types }
  }

  test("says hello to the page it's framed in, with no data and to any origin", () => {
    const { parent } = setup()

    expect(parent.postMessage).toHaveBeenCalledExactlyOnceWith({ v: 1, type: "hello" }, "*")
  })

  test("delivers what happened before the port arrived, in order, once it does", async () => {
    const { host, connect, types } = setup()

    host.report(makeInvoice({ status: "pending" }))
    host.close()
    connect()

    await vi.waitFor(() => expect(types()).toEqual(["ready", "close"]))
  })

  test.each([
    ["another window", { source: {} }],
    ["an unknown message", { data: { v: 1, type: "hello" } }],
    ["another protocol version", { data: { v: 2, type: "connect" } }],
  ])("ignores a port from %s", async (_case, options) => {
    const { host, connect, types } = setup()
    const ignored: EmbedFrameMessage[] = []

    connect(options, ignored)
    host.report(makeInvoice())
    connect()

    await vi.waitFor(() => expect(types()).toEqual(["ready"]))
    expect(ignored).toEqual([])
  })

  test("reports the invoice it shows as ready, then each change to it", async () => {
    const { host, connect, received } = setup()
    const invoice = makeInvoice({ id: "invoice-42", status: "pending", payment_id: "method-btc" })

    connect()
    host.report(invoice)
    host.report(invoice)
    host.report({ ...invoice, exception_status: "paid_partial", sent_amount: "0.0005" })

    await vi.waitFor(() => expect(received).toHaveLength(2))

    expect(received).toEqual([
      {
        v: 1,
        type: "ready",

        payload: {
          invoice_id: "invoice-42",
          status: "pending",
          exception_status: invoice.exception_status,
          sent_amount: invoice.sent_amount,
          paid_currency: invoice.paid_currency,
          payment_id: "method-btc",
        },
      },

      {
        v: 1,
        type: "status",

        payload: expect.objectContaining({
          status: "pending",
          exception_status: "paid_partial",
          sent_amount: "0.0005",
        }),
      },
    ])
  })

  test("announces an expiry once, after its status", async () => {
    const { host, connect, types } = setup()
    const invoice = makeInvoice({ status: "pending" })

    connect()
    host.report(invoice)
    host.report({ ...invoice, status: "expired" })
    host.report({ ...invoice, status: "expired", sent_amount: "0.0005" })

    await vi.waitFor(() => expect(types()).toEqual(["ready", "status", "expired", "status"]))
  })

  test("asks the page to return to the store with the invoice's last state", async () => {
    const { host, connect, received } = setup()

    connect()
    host.report(makeInvoice({ id: "invoice-42", status: "complete" }))
    host.returnToStore(REDIRECT_URL)

    await vi.waitFor(() => expect(received).toHaveLength(2))

    expect(received[1]).toEqual({
      v: 1,
      type: "complete",

      payload: expect.objectContaining({
        invoice_id: "invoice-42",
        status: "complete",
        redirect_url: REDIRECT_URL,
      }),
    })
  })

  test.each([
    ["not_found", Object.assign(new Error("Not Found"), { status: 404 })],
    ["load_failed", new Error("Network Error")],
  ])("reports a failed load as %s, once", async (reason, error) => {
    const { host, connect, received } = setup()

    connect()
    host.fail("invoice-42", error)
    host.fail("invoice-42", error)
    host.report(makeInvoice({ id: "invoice-42" }))

    await vi.waitFor(() =>
      expect(received).toEqual([
        { v: 1, type: "error", payload: { invoice_id: "invoice-42", reason } },
        expect.objectContaining({ type: "ready" }),
      ]),
    )
  })

  test("reports a failure again after the invoice has shown", async () => {
    const { host, connect, types } = setup()
    const error = new Error("Network Error")

    connect()
    host.fail("invoice-42", error)
    host.report(makeInvoice({ id: "invoice-42" }))
    host.fail("invoice-42", error)

    await vi.waitFor(() => expect(types()).toEqual(["error", "ready", "error"]))
  })
})
