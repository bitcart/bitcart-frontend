import { useCallback, useEffect, useRef, useState } from "react"

import { BITCART_API_URL } from "#/common/constants"

import type { InvoiceStatus, InvoiceWsMessage } from "../types"

const TERMINAL_STATUSES: InvoiceStatus[] = ["complete", "expired", "invalid"]
const MAX_RECONNECT_DELAY = 30_000
const INITIAL_RECONNECT_DELAY = 1_000

function deriveWsUrl(apiUrl: string): string {
  return apiUrl.replace(/^http/, "ws")
}

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
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  useEffect(() => {
    if (TERMINAL_STATUSES.includes(status)) {
      cleanup()

      return
    }

    const wsUrl = `${deriveWsUrl(BITCART_API_URL)}/ws/invoices/${invoiceId}`

    const connect = () => {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        reconnectDelayRef.current = INITIAL_RECONNECT_DELAY
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data) as InvoiceWsMessage
        onMessageRef.current(data)
      }

      ws.onclose = () => {
        setIsConnected(false)
        wsRef.current = null

        reconnectTimerRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, MAX_RECONNECT_DELAY)
          connect()
        }, reconnectDelayRef.current)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return cleanup
  }, [invoiceId, status, cleanup])

  return { isConnected }
}
