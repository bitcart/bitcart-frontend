import * as z from "zod"

import { asTerminalErrorCode, type TerminalErrorCode } from "./errors"

const optional = <T extends z.ZodType>(schema: T) => schema.optional().catch(undefined)

const stringList = z
  .array(z.unknown())
  .transform((entries) => entries.filter((entry) => typeof entry === "string"))

const terminalEnvSchema = z.object({
  contract: optional(z.number()),
  features: stringList.catch([]),

  shell: z
    .object({
      version: optional(z.string()),
      build: optional(z.number()),
      webview: optional(z.string()),
    })
    .catch({}),

  device: z
    .object({
      channel: optional(z.string()),
      vendor: optional(z.string()),
      model: optional(z.string()),
      serial: optional(z.string()),
    })
    .catch({}),

  capabilities: z
    .object({ printer: optional(z.object({ blocks: stringList.catch([]) })) })
    .catch({}),
})

export type TerminalEnv = z.infer<typeof terminalEnvSchema>

const replySchema = z.object({
  id: z.string(),

  response: z.object({
    ok: z.boolean().catch(false),
    value: z.unknown().optional(),
    code: optional(z.string()),
    diagnostic: optional(z.string()),
  }),
})

type RawResponse = z.infer<typeof replySchema>["response"]

type BridgeListener = (event: { data: string }) => void

export type TerminalBridge = {
  manifest: unknown
  postMessage: (message: string) => void
  addEventListener: (type: "message", listener: BridgeListener) => void
  removeEventListener: (type: "message", listener: BridgeListener) => void
}

declare global {
  interface Window {
    BitcartTerminal?: TerminalBridge
  }
}

export type TerminalResult<T> =
  | { ok: true; value: T }
  | { ok: false; code: TerminalErrorCode; diagnostic?: string }

const CALL_TIMEOUT_MS = 20_000

const pending = new Map<string, (response: RawResponse) => void>()
const envListeners = new Set<() => void>()

let callCounter = 0

//! Not `crypto.randomUUID`: terminals load the app over plain HTTP on a LAN, which isn't a secure
//! context, so it's undefined there.
const nextCallbackId = () => `bt-${++callCounter}-${Math.random().toString(36).slice(2)}`

let cachedEnv: TerminalEnv | null | undefined

export const terminalEnv = (): TerminalEnv | null => {
  if (cachedEnv === undefined) {
    cachedEnv =
      typeof window === "undefined"
        ? null
        : (terminalEnvSchema.safeParse(window.BitcartTerminal?.manifest).data ?? null)
  }

  return cachedEnv
}

export const resetTerminalEnv = () => {
  cachedEnv = undefined
  envListeners.forEach((listener) => listener())
}

export const subscribeTerminalEnv = (listener: () => void) => {
  envListeners.add(listener)

  return () => void envListeners.delete(listener)
}

export const hasFeature = (env: TerminalEnv | null, method: string) =>
  env?.features.includes(method) ?? false

const parseReply = (data: unknown) => {
  try {
    return replySchema.safeParse(JSON.parse(String(data))).data ?? null
  } catch {
    return null
  }
}

const receive: BridgeListener = ({ data }) => {
  const reply = parseReply(data)

  if (reply) {
    pending.get(reply.id)?.(reply.response)
    pending.delete(reply.id)
  }
}

const listenedBridges = new WeakSet<TerminalBridge>()

const send = (method: string, payload: object, id: string) => {
  const bridge = window.BitcartTerminal

  if (!bridge) {
    throw new Error("no bridge")
  } else {
    //! Nothing is queued: the listener must be attached before the first message is posted.
    if (!listenedBridges.has(bridge)) {
      bridge.addEventListener("message", receive)
      listenedBridges.add(bridge)
    }

    bridge.postMessage(JSON.stringify({ id, method, payload }))
  }
}

const call = (method: string, payload: object) =>
  new Promise<RawResponse>((resolve) => {
    const id = nextCallbackId()

    const timeout = setTimeout(() => {
      if (pending.delete(id)) resolve({ ok: false, code: "TIMEOUT" })
    }, CALL_TIMEOUT_MS)

    pending.set(id, (response) => {
      clearTimeout(timeout)
      resolve(response)
    })

    try {
      send(method, payload, id)
    } catch (error) {
      clearTimeout(timeout)
      pending.delete(id)
      resolve({ ok: false, code: "UNKNOWN", diagnostic: `bridge threw: ${String(error)}` })
    }
  })

export const invoke = async <T>(
  method: string,
  payload: object = {},
): Promise<TerminalResult<T>> => {
  if (!hasFeature(terminalEnv(), method)) {
    return { ok: false, code: "UNSUPPORTED", diagnostic: `method=${method}` }
  } else {
    const raw = await call(method, payload)

    if (raw.ok) {
      return { ok: true, value: raw.value as T }
    } else return { ok: false, code: asTerminalErrorCode(raw.code), diagnostic: raw.diagnostic }
  }
}
