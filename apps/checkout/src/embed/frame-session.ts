import {
  EMBED_PROTOCOL_VERSION,
  type EmbedConnectMessage,
  type EmbedFrameMessage,
  type EmbedHelloMessage,
} from "#/common/integrations/embed/protocol"

const FRAME_MESSAGE_TYPES = {
  ready: true,
  status: true,
  expired: true,
  complete: true,
  close: true,
  error: true,
} satisfies Record<EmbedFrameMessage["type"], true>

const isProtocolMessage = (data: unknown): data is { v: number; type: string } =>
  typeof data === "object" &&
  data !== null &&
  "v" in data &&
  data.v === EMBED_PROTOCOL_VERSION &&
  "type" in data &&
  typeof data.type === "string"

const isHelloMessage = (data: unknown): data is EmbedHelloMessage =>
  isProtocolMessage(data) && data.type === "hello"

const isFrameMessage = (data: unknown): data is EmbedFrameMessage =>
  isProtocolMessage(data) && Object.hasOwn(FRAME_MESSAGE_TYPES, data.type)

export type FrameSession = { stop: () => void }

export const startFrameSession = ({
  host = window,
  frame,
  origins,
  stallDelayMs,
  onMessage,
  onStall,
}: {
  host?: Window
  frame: Pick<HTMLIFrameElement, "contentWindow">
  origins: readonly string[]
  stallDelayMs: number
  onMessage: (message: EmbedFrameMessage) => void
  onStall: () => void
}): FrameSession => {
  let port: MessagePort | null = null
  const stallTimer = setTimeout(onStall, stallDelayMs)

  const handleMessage = ({ data }: MessageEvent<unknown>) => {
    if (isFrameMessage(data)) {
      if (data.type === "ready" || data.type === "error") clearTimeout(stallTimer)

      onMessage(data)
    }
  }

  const handleHello = ({ source, origin: senderOrigin, data }: MessageEvent<unknown>) => {
    const frameWindow = frame.contentWindow

    if (
      frameWindow &&
      source === frameWindow &&
      origins.includes(senderOrigin) &&
      isHelloMessage(data)
    ) {
      const channel = new MessageChannel()

      host.removeEventListener("message", handleHello)
      port = channel.port1
      port.onmessage = handleMessage

      frameWindow.postMessage(
        { v: EMBED_PROTOCOL_VERSION, type: "connect" } satisfies EmbedConnectMessage,
        senderOrigin,
        [channel.port2],
      )
    }
  }

  host.addEventListener("message", handleHello)

  return {
    stop: () => {
      clearTimeout(stallTimer)
      host.removeEventListener("message", handleHello)
      port?.close()
    },
  }
}
