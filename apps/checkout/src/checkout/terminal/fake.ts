import type { TerminalErrorCode } from "./errors"
import { PRINTER_PRINT, type ReceiptBlock } from "./printer"
import { resetTerminalEnv, type TerminalBridge, type TerminalEnv } from "./protocol"

export type FakeTerminalOptions = {
  printer?: boolean
  failWith?: TerminalErrorCode
  latencyMs?: number
  onInvoke?: (method: string, payload: unknown) => void
}

type Listener = Parameters<TerminalBridge["addEventListener"]>[1]
type Envelope =
  | { ok: true; value: null }
  | { ok: false; code: TerminalErrorCode; diagnostic: string }

const BLOCK_KINDS: ReceiptBlock["kind"][] = ["text", "qr", "rule", "space", "field"]

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const parseMessage = (message: string): unknown => {
  try {
    return JSON.parse(message)
  } catch {
    return null
  }
}

//* Implements the bridge contract rather than mocking this module, so it doubles as an executable
//* specification of the shell's side of it. Returns an uninstaller that can also emit an event.
export const installFakeTerminal = ({
  printer = true,
  failWith,
  latencyMs = 0,
  onInvoke,
}: FakeTerminalOptions = {}) => {
  const manifest: TerminalEnv = {
    contract: 1,
    features: printer ? [PRINTER_PRINT] : [],
    shell: { version: "fake", build: 0 },
    device: { channel: "fake", vendor: "Fake", model: "Fake Terminal" },
    capabilities: printer ? { printer: { blocks: BLOCK_KINDS } } : {},
  }

  const listeners = new Set<Listener>()

  const deliver = (message: object) => {
    const data = JSON.stringify(message)

    listeners.forEach((listener) => listener({ data }))
  }

  const answer = (method: unknown, payload: unknown): Envelope => {
    if (typeof method !== "string" || (payload !== undefined && !isObject(payload))) {
      return { ok: false, code: "PAYLOAD_INVALID", diagnostic: "fake" }
    } else {
      onInvoke?.(method, payload ?? {})

      if (!manifest.features.includes(method)) {
        return { ok: false, code: "UNSUPPORTED", diagnostic: `method=${method}` }
      } else if (failWith) {
        return { ok: false, code: failWith, diagnostic: "fake" }
      } else return { ok: true, value: null }
    }
  }

  const bridge: TerminalBridge = {
    manifest,

    postMessage: (message) => {
      const call = parseMessage(message)

      if (isObject(call) && typeof call.id === "string" && call.id !== "") {
        const response = answer(call.method, call.payload)

        setTimeout(() => deliver({ id: call.id, response }), latencyMs)
      }
    },

    addEventListener: (type, listener) => {
      if (type === "message") listeners.add(listener)
    },

    removeEventListener: (type, listener) => {
      if (type === "message") listeners.delete(listener)
    },
  }

  const previous = window.BitcartTerminal

  window.BitcartTerminal = bridge
  resetTerminalEnv()

  const uninstall = () => {
    window.BitcartTerminal = previous
    resetTerminalEnv()
  }

  return Object.assign(uninstall, {
    emit: (event: string, payload: unknown) => deliver({ event, payload }),
  })
}
