import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from "vitest"

import type { EmbedFrameMessage } from "#/common/integrations/embed/protocol"

import { startFrameSession } from "./frame-session"

const ORIGIN = "https://pay.example.com"
const REDIRECTED_ORIGIN = "https://checkout.example.com"
const STALL_DELAY_MS = 8000

const READY: EmbedFrameMessage = {
  v: 1,
  type: "ready",

  payload: {
    invoice_id: "inv-1",
    status: "pending",
    exception_status: "none",
    sent_amount: "0",
    sent_price: "0.00",
    currency: "USD",
    paid_currency: "",
    payment_id: "",
  },
}

const setup = () => {
  const host = new EventTarget() as unknown as Window

  const frameWindow = {
    postMessage: vi.fn<(message: unknown, origin: string, ports: MessagePort[]) => void>(),
  }

  const frame = { contentWindow: frameWindow as unknown as Window }
  const received: EmbedFrameMessage[] = []
  const onStall = vi.fn()

  const session = startFrameSession({
    host,
    frame,
    origins: [ORIGIN, REDIRECTED_ORIGIN],
    stallDelayMs: STALL_DELAY_MS,
    onMessage: (message) => received.push(message),
    onStall,
  })

  onTestFinished(() => session.stop())

  const sayHello = ({
    source = frameWindow as unknown,
    origin = ORIGIN,
    data = { v: 1, type: "hello" } as unknown,
  } = {}) => host.dispatchEvent(Object.assign(new Event("message"), { source, origin, data }))

  const connectedPort = (): MessagePort => {
    const port = frameWindow.postMessage.mock.lastCall?.[2][0]

    if (!port) throw new Error("No port was transferred")

    onTestFinished(() => port.close())

    return port
  }

  return { session, frameWindow, received, onStall, sayHello, connectedPort }
}

describe("startFrameSession", () => {
  test("answers the frame's hello with a port, posted to the checkout origin only", () => {
    const { frameWindow, sayHello } = setup()

    sayHello()

    expect(frameWindow.postMessage).toHaveBeenCalledExactlyOnceWith(
      { v: 1, type: "connect" },
      ORIGIN,
      [expect.any(MessagePort)],
    )
  })

  test("answers a hello from another trusted origin at that origin", () => {
    const { frameWindow, sayHello } = setup()

    sayHello({ origin: REDIRECTED_ORIGIN })

    expect(frameWindow.postMessage).toHaveBeenCalledExactlyOnceWith(
      { v: 1, type: "connect" },
      REDIRECTED_ORIGIN,
      [expect.any(MessagePort)],
    )
  })

  test.each([
    ["another window", { source: {} }],
    ["another origin", { origin: "https://pay.example.com.evil.test" }],
    ["an origin the checkout's is a prefix of", { origin: "https://pay.example.co" }],
    ["another message", { data: { v: 1, type: "connect" } }],
    ["another protocol version", { data: { v: 2, type: "hello" } }],
    ["a string", { data: "loaded" }],
  ])("ignores a hello from %s", (_case, options) => {
    const { frameWindow, sayHello } = setup()

    sayHello(options)

    expect(frameWindow.postMessage).not.toHaveBeenCalled()
  })

  test("connects once", () => {
    const { frameWindow, sayHello } = setup()

    sayHello()
    sayHello()

    expect(frameWindow.postMessage).toHaveBeenCalledOnce()
  })

  test("passes on the checkout's messages and drops anything else", async () => {
    const { received, sayHello, connectedPort } = setup()

    sayHello()

    const port = connectedPort()

    port.postMessage({ v: 1, type: "unknown" })
    port.postMessage({ v: 1, type: "toString" })
    port.postMessage({ v: 2, type: "close" })
    port.postMessage("close")
    port.postMessage(READY)
    port.postMessage({ v: 1, type: "close" })

    await vi.waitFor(() => expect(received).toEqual([READY, { v: 1, type: "close" }]))
  })

  test("stops listening to the port once stopped", async () => {
    const { session, received, sayHello, connectedPort } = setup()

    sayHello()

    const port = connectedPort()

    session.stop()
    port.postMessage(READY)
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(received).toEqual([])
  })

  test("ignores a hello once stopped", () => {
    const { session, frameWindow, sayHello } = setup()

    session.stop()
    sayHello()

    expect(frameWindow.postMessage).not.toHaveBeenCalled()
  })

  describe("stall", () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    test("reports a stall when the checkout shows nothing in time", () => {
      const { onStall } = setup()

      vi.advanceTimersByTime(STALL_DELAY_MS - 1)
      expect(onStall).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(onStall).toHaveBeenCalledOnce()
    })

    test.each([
      ["an invoice", READY],
      ["an error", { v: 1, type: "error", payload: { invoice_id: "inv-1", reason: "not_found" } }],
    ])("reports no stall once the checkout shows %s", async (_case, message) => {
      const { received, onStall, sayHello, connectedPort } = setup()

      sayHello()
      connectedPort().postMessage(message)
      await vi.waitFor(() => expect(received).toHaveLength(1))
      vi.advanceTimersByTime(STALL_DELAY_MS)

      expect(onStall).not.toHaveBeenCalled()
    })

    test("still reports a stall after the hello alone", () => {
      const { onStall, sayHello } = setup()

      sayHello()
      vi.advanceTimersByTime(STALL_DELAY_MS)

      expect(onStall).toHaveBeenCalledOnce()
    })

    test("reports no stall once stopped", () => {
      const { session, onStall } = setup()

      session.stop()
      vi.advanceTimersByTime(STALL_DELAY_MS)

      expect(onStall).not.toHaveBeenCalled()
    })
  })
})
