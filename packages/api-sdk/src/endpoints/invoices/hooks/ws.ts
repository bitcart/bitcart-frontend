import { useEffect, useRef, useState } from "react"

import { BitcartApiConfig } from "#/config"

import { INITIAL_WS_RECONNECT_DELAY, MAX_WS_RECONNECT_DELAY } from "../constants"
import type { InvoiceStatus, InvoiceWsMessage } from "../types"
import { isTerminalStatus } from "../utils"

export type UseInvoiceWebsocketParams = {
  invoiceId: string
  status: InvoiceStatus
  onMessage: (message: InvoiceWsMessage) => void
}

export const useInvoiceWebsocket = ({
  invoiceId,
  status,
  onMessage,
}: UseInvoiceWebsocketParams) => {
  const [isConnected, setIsConnected] = useState(false)
  const onMessageRef = useRef(onMessage)
  const isStatusTerminal = isTerminalStatus(status)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (isStatusTerminal) return void null

    const wsUrl = `${BitcartApiConfig.websocketBaseUrl}/ws/invoices/${invoiceId}`

    let socket: WebSocket | null = null
    let reconnectDelay: number = INITIAL_WS_RECONNECT_DELAY
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      const ws = new WebSocket(wsUrl)

      socket = ws

      ws.onopen = () => {
        setIsConnected(true)
        reconnectDelay = INITIAL_WS_RECONNECT_DELAY
      }

      ws.onmessage = (event) => {
        try {
          onMessageRef.current(JSON.parse(event.data) as InvoiceWsMessage)
        } catch {
          //* Dropping malformed frames instead of throwing errors from the event handler.
        }
      }

      ws.onclose = () => {
        setIsConnected(false)

        socket = null

        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, MAX_WS_RECONNECT_DELAY)
          connect()
        }, reconnectDelay)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)

      if (socket) {
        //* Preventing further reconnects (`close()` fires `onclose` asynchronously).
        socket.onclose = null

        //* A socket torn down mid-handshake still fires `onerror` afterwards, which would
        //* otherwise re-enter `close()` on an already-closed socket.
        socket.onerror = null

        socket.close()
      }

      setIsConnected(false)
    }
  }, [invoiceId, isStatusTerminal])

  return { isConnected }
}
