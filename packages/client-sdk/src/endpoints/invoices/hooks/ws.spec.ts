import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { BitcartApiConfig } from "#/config"

import {
  INITIAL_WS_RECONNECT_DELAY_MS,
  MAX_WS_RECONNECT_ATTEMPTS,
  MAX_WS_RECONNECT_DELAY_MS,
  STABLE_WS_CONNECTION_DURATION_MS,
} from "../constants"
import { useInvoiceWebsocket, type UseInvoiceWebsocketParams } from "./ws"

class FakeWebSocket {
  static instances: FakeWebSocket[] = []

  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null
  isClosed = false

  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this)
  }

  close() {
    this.isClosed = true
  }
}

//* With `Math.random` pinned to 0, the jitter halves every delay.
const JITTER_FACTOR = 0.5

const API_BASE_URL = "https://api.example.test"
const INVOICE_ID = "invoice-1"

const latestSocket = () => FakeWebSocket.instances.at(-1) as FakeWebSocket

const openSocket = (socket = latestSocket()) => {
  act(() => {
    socket.onopen?.()
  })
}

const dropSocket = (socket = latestSocket()) => {
  act(() => {
    socket.isClosed = true
    socket.onclose?.()
  })
}

const advanceTime = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

const dispatchConnectivity = (type: "online" | "offline") => {
  act(() => {
    window.dispatchEvent(new Event(type))
  })
}

const renderWebsocket = (params: Partial<UseInvoiceWebsocketParams> = {}) => {
  const initialProps: UseInvoiceWebsocketParams = {
    invoiceId: INVOICE_ID,
    status: "pending",
    onMessage: vi.fn(),
    ...params,
  }

  return renderHook((props: UseInvoiceWebsocketParams) => useInvoiceWebsocket(props), {
    initialProps,
  })
}

beforeEach(() => {
  FakeWebSocket.instances = []
  vi.stubGlobal("WebSocket", FakeWebSocket)
  vi.useFakeTimers()
  vi.spyOn(Math, "random").mockReturnValue(0)
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true)
  BitcartApiConfig.set({ baseUrl: API_BASE_URL })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("useInvoiceWebsocket", () => {
  describe("connection", () => {
    test("subscribes to the invoice's feed and reports when the socket opens", () => {
      const onConnect = vi.fn()
      const { result } = renderWebsocket({ onConnect })

      expect(FakeWebSocket.instances).toHaveLength(1)
      expect(latestSocket().url).toBe(`wss://api.example.test/ws/invoices/${INVOICE_ID}`)
      expect(result.current.isConnected).toBe(false)

      openSocket()

      expect(result.current.isConnected).toBe(true)
      expect(onConnect).toHaveBeenCalledOnce()
    })

    test("forwards parsed messages and drops malformed frames", () => {
      const onMessage = vi.fn()

      renderWebsocket({ onMessage })
      openSocket()

      act(() => {
        latestSocket().onmessage?.({ data: '{"status":"paid"}' })
        latestSocket().onmessage?.({ data: "not json" })
      })

      expect(onMessage).toHaveBeenCalledOnce()
      expect(onMessage).toHaveBeenCalledWith({ status: "paid" })
    })

    test("does not subscribe to an invoice that can no longer change", () => {
      renderWebsocket({ status: "complete" })

      expect(FakeWebSocket.instances).toHaveLength(0)
    })

    test("unsubscribes once the invoice can no longer change, without reconnecting", () => {
      const { rerender, result } = renderWebsocket()
      const socket = latestSocket()

      openSocket(socket)
      rerender({ invoiceId: INVOICE_ID, status: "complete", onMessage: vi.fn() })
      advanceTime(MAX_WS_RECONNECT_DELAY_MS)

      expect(socket.isClosed).toBe(true)
      expect(FakeWebSocket.instances).toHaveLength(1)
      expect(result.current.isConnected).toBe(false)
    })

    test("closes the socket on unmount, without reconnecting", () => {
      const { unmount } = renderWebsocket()
      const socket = latestSocket()

      openSocket(socket)
      unmount()
      advanceTime(MAX_WS_RECONNECT_DELAY_MS)

      expect(socket.isClosed).toBe(true)
      expect(socket.onclose).toBeNull()
      expect(FakeWebSocket.instances).toHaveLength(1)
    })
  })

  describe("reconnection", () => {
    test("retries with doubling delays until it reaches the attempt limit", () => {
      const { result } = renderWebsocket()
      let delay = INITIAL_WS_RECONNECT_DELAY_MS

      for (let attempt = 1; attempt <= MAX_WS_RECONNECT_ATTEMPTS; attempt++) {
        dropSocket()

        expect(result.current.isReconnecting).toBe(true)

        advanceTime(delay * JITTER_FACTOR - 1)

        expect(FakeWebSocket.instances).toHaveLength(attempt)

        advanceTime(1)

        expect(FakeWebSocket.instances).toHaveLength(attempt + 1)

        delay = Math.min(delay * 2, MAX_WS_RECONNECT_DELAY_MS)
      }

      dropSocket()
      advanceTime(MAX_WS_RECONNECT_DELAY_MS)

      expect(FakeWebSocket.instances).toHaveLength(MAX_WS_RECONNECT_ATTEMPTS + 1)
      expect(result.current.isReconnecting).toBe(false)
      expect(result.current.isReconnectLimitReached).toBe(true)
    })

    test("calls `onConnect` again on every reconnection", () => {
      const onConnect = vi.fn()

      renderWebsocket({ onConnect })
      openSocket()
      dropSocket()
      advanceTime(INITIAL_WS_RECONNECT_DELAY_MS * JITTER_FACTOR)
      openSocket()

      expect(onConnect).toHaveBeenCalledTimes(2)
    })

    test("starts the backoff over after a stable connection", () => {
      renderWebsocket()
      dropSocket()
      advanceTime(INITIAL_WS_RECONNECT_DELAY_MS * JITTER_FACTOR)
      openSocket()
      advanceTime(STABLE_WS_CONNECTION_DURATION_MS)
      dropSocket()
      advanceTime(INITIAL_WS_RECONNECT_DELAY_MS * JITTER_FACTOR)

      expect(FakeWebSocket.instances).toHaveLength(3)
    })

    test("keeps backing off when a connection drops before it is stable", () => {
      renderWebsocket()
      dropSocket()
      advanceTime(INITIAL_WS_RECONNECT_DELAY_MS * JITTER_FACTOR)
      openSocket()
      advanceTime(STABLE_WS_CONNECTION_DURATION_MS - 1)
      dropSocket()
      advanceTime(INITIAL_WS_RECONNECT_DELAY_MS * JITTER_FACTOR)

      expect(FakeWebSocket.instances).toHaveLength(2)

      advanceTime(INITIAL_WS_RECONNECT_DELAY_MS * JITTER_FACTOR)

      expect(FakeWebSocket.instances).toHaveLength(3)
    })

    test("connects again on demand after giving up", () => {
      const { result } = renderWebsocket()

      for (let attempt = 0; attempt <= MAX_WS_RECONNECT_ATTEMPTS; attempt++) {
        dropSocket()
        advanceTime(MAX_WS_RECONNECT_DELAY_MS)
      }

      expect(result.current.isReconnectLimitReached).toBe(true)

      act(() => {
        result.current.reconnect()
      })

      expect(FakeWebSocket.instances).toHaveLength(MAX_WS_RECONNECT_ATTEMPTS + 2)
      expect(result.current.isReconnectLimitReached).toBe(false)
    })
  })

  describe("connectivity", () => {
    test("suspends reconnection while offline and resumes once back online", () => {
      const { result } = renderWebsocket()

      openSocket()
      dispatchConnectivity("offline")
      dropSocket()
      advanceTime(MAX_WS_RECONNECT_DELAY_MS)

      expect(FakeWebSocket.instances).toHaveLength(1)
      expect(result.current.isReconnecting).toBe(false)
      expect(result.current.isClientOnline).toBe(false)

      dispatchConnectivity("online")

      expect(FakeWebSocket.instances).toHaveLength(2)
    })

    test("resumes when connectivity returns before the drop is handled", () => {
      renderWebsocket()
      openSocket()
      dispatchConnectivity("offline")

      act(() => {
        window.dispatchEvent(new Event("online"))
        latestSocket().isClosed = true
        latestSocket().onclose?.()
      })

      expect(FakeWebSocket.instances).toHaveLength(2)
    })
  })
})
