import { afterEach, describe, expect, test, vi } from "vitest"

import { installFakeTerminal } from "./fake"
import { hasPrinter, printReceipt, type ReceiptSpec } from "./printer"
import { resetTerminalEnv, terminalEnv, type TerminalBridge, type TerminalEnv } from "./protocol"

const SPEC: ReceiptSpec = { blocks: [{ kind: "text", text: "Example Store" }] }

const MANIFEST: TerminalEnv = {
  contract: 1,
  features: ["printer.print"],
  shell: { version: "1.0.0", build: 1 },
  device: { channel: "paxstore", vendor: "PAX", model: "A920Pro" },
  capabilities: { printer: { blocks: ["text", "qr", "rule", "space", "field"] } },
}

type Listener = Parameters<TerminalBridge["addEventListener"]>[1]

let uninstall: (() => void) | undefined

afterEach(() => {
  uninstall?.()
  uninstall = undefined
  delete window.BitcartTerminal
  resetTerminalEnv()
  vi.useRealTimers()
})

const installBridge = (
  onPost: (message: string, reply: (data: string) => void) => void,
  { manifest }: { manifest: unknown } = { manifest: MANIFEST },
) => {
  const listeners = new Set<Listener>()
  const reply = (data: string) => listeners.forEach((listener) => listener({ data }))
  const postMessage = vi.fn((message: string) => onPost(message, reply))

  const addEventListener = vi.fn(
    (_type: "message", listener: Listener) => void listeners.add(listener),
  )

  const removeEventListener = vi.fn(
    (_type: "message", listener: Listener) => void listeners.delete(listener),
  )

  window.BitcartTerminal = { manifest, postMessage, addEventListener, removeEventListener }
  resetTerminalEnv()

  return { postMessage, addEventListener }
}

const replyTo = (message: string, response: object) =>
  JSON.stringify({ id: (JSON.parse(message) as { id: string }).id, response })

const answerOk = (message: string, reply: (data: string) => void) =>
  reply(replyTo(message, { ok: true, value: null }))

describe("terminalEnv", () => {
  test("finds no terminal in a plain browser", () => {
    expect(terminalEnv()).toBeNull()
  })

  test("reads the manifest from the shell's bridge object", () => {
    installBridge(vi.fn())

    expect(terminalEnv()).toStrictEqual(MANIFEST)
  })

  test("drops a malformed field without disqualifying the shell", () => {
    installBridge(vi.fn(), {
      manifest: {
        ...MANIFEST,
        features: ["printer.print", 42],
        shell: "1.0.0",
        device: { ...MANIFEST.device, serial: null },
      },
    })

    expect(terminalEnv()).toMatchObject({
      features: ["printer.print"],
      shell: {},
      capabilities: MANIFEST.capabilities,
    })

    expect(terminalEnv()?.device.serial).toBeUndefined()
    expect(hasPrinter(terminalEnv())).toBe(true)
  })

  test.each([{}, { blocks: "text" }])(
    "keeps a printer whose block list is malformed (%o)",
    (printer) => {
      installBridge(vi.fn(), { manifest: { ...MANIFEST, capabilities: { printer } } })

      expect(terminalEnv()?.capabilities).toStrictEqual({ printer: { blocks: [] } })
      expect(hasPrinter(terminalEnv())).toBe(true)
    },
  )

  test("treats a manifest with nothing it can use as a terminal without features", () => {
    installBridge(vi.fn(), { manifest: { contract: 1 } })

    expect(terminalEnv()).toMatchObject({ features: [], capabilities: {} })
    expect(hasPrinter(terminalEnv())).toBe(false)
  })

  test.each([undefined, null, 42, "manifest", []])(
    "treats a bridge whose manifest is %o as no terminal",
    (manifest) => {
      installBridge(vi.fn(), { manifest })

      expect(terminalEnv()).toBeNull()
    },
  )
})

describe("installFakeTerminal", () => {
  test("lists the baseline block kinds with its printer, as a real shell does", () => {
    uninstall = installFakeTerminal()

    expect(terminalEnv()?.capabilities).toStrictEqual(MANIFEST.capabilities)
  })

  test("advertises no printer capability without a printer", () => {
    uninstall = installFakeTerminal({ printer: false })

    expect(terminalEnv()?.capabilities).toStrictEqual({})
  })

  test("hands the page back the bridge it stood in for", () => {
    installBridge(vi.fn())
    const shell = window.BitcartTerminal

    const restore = installFakeTerminal({ printer: false })

    expect(terminalEnv()?.device.channel).toBe("fake")

    restore()

    expect(window.BitcartTerminal).toBe(shell)
    expect(terminalEnv()).toStrictEqual(MANIFEST)
  })

  describe("answers raw messages as the contract specifies", () => {
    const exchange = async (message: string, onInvoke = vi.fn()) => {
      uninstall = installFakeTerminal({ onInvoke })

      const replies: unknown[] = []

      window.BitcartTerminal?.addEventListener("message", ({ data }) =>
        replies.push(JSON.parse(data)),
      )

      window.BitcartTerminal?.postMessage(message)
      await new Promise((resolve) => setTimeout(resolve, 0))

      return replies
    }

    test.each([
      ["a call", '{"id":"a","method":"printer.print","payload":{}}', { ok: true, value: null }],
      [
        "a call to a method it doesn't serve",
        '{"id":"a","method":"scanner.read"}',
        { ok: false, code: "UNSUPPORTED", diagnostic: "method=scanner.read" },
      ],
      [
        "a call without a method",
        '{"id":"a","payload":{}}',
        { ok: false, code: "PAYLOAD_INVALID", diagnostic: "fake" },
      ],
      [
        "a call whose payload isn't an object",
        '{"id":"a","method":"printer.print","payload":[]}',
        { ok: false, code: "PAYLOAD_INVALID", diagnostic: "fake" },
      ],
    ])("replies once to %s", async (_case, message, response) => {
      expect(await exchange(message)).toStrictEqual([{ id: "a", response }])
    })

    test("treats an absent payload as an empty one", async () => {
      const onInvoke = vi.fn()

      await exchange('{"id":"a","method":"printer.print"}', onInvoke)

      expect(onInvoke).toHaveBeenCalledWith("printer.print", {})
    })

    test.each([
      '{"method":"printer.print"}',
      '{"id":"","method":"printer.print"}',
      '{"id":7,"method":"printer.print"}',
      "{}",
      "not json",
    ])("doesn't reply to %s", async (message) => {
      expect(await exchange(message)).toStrictEqual([])
    })
  })

  test("delivers an event to every listener", () => {
    const fake = installFakeTerminal()
    const first = vi.fn()
    const second = vi.fn()

    uninstall = fake
    window.BitcartTerminal?.addEventListener("message", first)
    window.BitcartTerminal?.addEventListener("message", second)
    fake.emit("scanner.result", { text: "4006381333931" })

    const data = JSON.stringify({ event: "scanner.result", payload: { text: "4006381333931" } })

    expect(first).toHaveBeenCalledWith({ data })
    expect(second).toHaveBeenCalledWith({ data })
  })
})

describe("hasPrinter", () => {
  test("needs both the printer capability and the print method", () => {
    expect(hasPrinter(MANIFEST)).toBe(true)
    expect(hasPrinter({ ...MANIFEST, features: [] })).toBe(false)
    expect(hasPrinter({ ...MANIFEST, capabilities: {} })).toBe(false)
    expect(hasPrinter(null)).toBe(false)
  })
})

describe("printReceipt", () => {
  test("sends the receipt to the shell", async () => {
    const onInvoke = vi.fn()
    uninstall = installFakeTerminal({ onInvoke })

    await expect(printReceipt(SPEC)).resolves.toStrictEqual({ ok: true, value: null })
    expect(onInvoke).toHaveBeenCalledWith("printer.print", SPEC)
  })

  test("reports the shell's error code and diagnostic", async () => {
    uninstall = installFakeTerminal({ failWith: "PRINTER_OUT_OF_PAPER" })

    await expect(printReceipt(SPEC)).resolves.toStrictEqual({
      ok: false,
      code: "PRINTER_OUT_OF_PAPER",
      diagnostic: "fake",
    })
  })

  test("doesn't call a shell that has no printer", async () => {
    const onInvoke = vi.fn()
    uninstall = installFakeTerminal({ printer: false, onInvoke })

    await expect(printReceipt(SPEC)).resolves.toMatchObject({ ok: false, code: "UNSUPPORTED" })
    expect(onInvoke).not.toHaveBeenCalled()
  })

  test("refuses to print outside a terminal", async () => {
    await expect(printReceipt(SPEC)).resolves.toMatchObject({ ok: false, code: "UNSUPPORTED" })
  })

  test("collapses an error code this bundle doesn't know to UNKNOWN", async () => {
    installBridge((message, reply) =>
      reply(
        replyTo(message, { ok: false, code: "PRINTER_ON_FIRE", diagnostic: "vendor:status=99" }),
      ),
    )

    await expect(printReceipt(SPEC)).resolves.toStrictEqual({
      ok: false,
      code: "UNKNOWN",
      diagnostic: "vendor:status=99",
    })
  })

  test("settles a reply with a malformed envelope instead of waiting it out", async () => {
    installBridge((message, reply) => reply(replyTo(message, {})))

    await expect(printReceipt(SPEC)).resolves.toStrictEqual({
      ok: false,
      code: "UNKNOWN",
      diagnostic: undefined,
    })
  })

  test("listens once per bridge, before its first message", async () => {
    const { postMessage, addEventListener } = installBridge(answerOk)

    await printReceipt(SPEC)
    await printReceipt(SPEC)

    expect(addEventListener).toHaveBeenCalledOnce()

    expect(addEventListener.mock.invocationCallOrder[0]).toBeLessThan(
      postMessage.mock.invocationCallOrder[0] ?? 0,
    )
  })

  test("leaves the bridge's other listeners receiving its messages", async () => {
    const fake = installFakeTerminal()
    const other = vi.fn()

    uninstall = fake
    window.BitcartTerminal?.addEventListener("message", other)

    await expect(printReceipt(SPEC)).resolves.toMatchObject({ ok: true })
    expect(other).toHaveBeenCalledWith({ data: expect.stringContaining('"response"') as unknown })
  })

  test("ignores events, unparseable messages and replies to other calls", async () => {
    installBridge((message, reply) => {
      reply(JSON.stringify({ event: "scanner.result", payload: {} }))
      reply("not json")
      reply(JSON.stringify({ id: "someone-else", response: { ok: false, code: "TIMEOUT" } }))
      answerOk(message, reply)
    })

    await expect(printReceipt(SPEC)).resolves.toStrictEqual({ ok: true, value: null })
  })

  test("takes an event between calls in its stride", async () => {
    const fake = installFakeTerminal()

    uninstall = fake
    await printReceipt(SPEC)

    expect(() => fake.emit("scanner.result", { text: "4006381333931" })).not.toThrow()
  })

  test("gives up on a shell that never answers", async () => {
    vi.useFakeTimers()
    installBridge(vi.fn())

    const result = printReceipt(SPEC)
    await vi.advanceTimersByTimeAsync(20_000)

    await expect(result).resolves.toMatchObject({ ok: false, code: "TIMEOUT" })
  })

  test("reports a bridge that throws instead of hanging", async () => {
    installBridge(() => {
      throw new Error("WebView gone")
    })

    await expect(printReceipt(SPEC)).resolves.toStrictEqual({
      ok: false,
      code: "UNKNOWN",
      diagnostic: "bridge threw: Error: WebView gone",
    })
  })
})
