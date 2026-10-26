import type { SocketConnectionHandle } from "@bitcart/core/types"
import { useIsOnline } from "@bitcart/hooks"
import { useCallback, useEffect, useEffectEvent, useState } from "react"

import { BitcartApiConfig } from "#/config"

import {
  INITIAL_WS_RECONNECT_DELAY_MS,
  MAX_WS_RECONNECT_ATTEMPTS,
  MAX_WS_RECONNECT_DELAY_MS,
  STABLE_WS_CONNECTION_DURATION_MS,
  WS_RECONNECT_JITTER_RATIO,
} from "../constants"
import type { InvoiceStatus, InvoiceWsMessage } from "../types"
import { isTerminalStatus } from "../utils"

export type UseInvoiceWebsocketParams = {
  invoiceId: string
  status: InvoiceStatus
  onMessage: (message: InvoiceWsMessage) => void

  /**
   * Called on the initial connection and every subsequent reconnection.
   */
  onConnect?: () => void
}

export type UseInvoiceWebsocketResult = SocketConnectionHandle & {}

const applyReconnectJitter = (delay: number): number =>
  delay * (1 - WS_RECONNECT_JITTER_RATIO + Math.random() * WS_RECONNECT_JITTER_RATIO)

/**
 * Subscribes to an invoice's status feed for as long as the invoice can still change.
 */
export const useInvoiceWebsocket = ({
  invoiceId,
  status,
  onMessage,
  onConnect,
}: UseInvoiceWebsocketParams): UseInvoiceWebsocketResult => {
  const endpointUrl = `${BitcartApiConfig.websocketBaseUrl}/ws/invoices/${invoiceId}`
  const [isConnected, setIsConnected] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isReconnectLimitReached, setIsReconnectLimitReached] = useState(false)
  const [isReconnectSuspended, setIsReconnectSuspended] = useState(false)
  const [connectionAttemptCount, setConnectionAttemptCount] = useState(0)
  const isClientOnline = useIsOnline()
  const isStatusTerminal = isTerminalStatus(status)
  const isReconnectAllowed = useEffectEvent(() => isClientOnline)
  const handleMessage = useEffectEvent((message: InvoiceWsMessage) => onMessage(message))
  const handleConnect = useEffectEvent(() => onConnect?.())

  useEffect(() => {
    if (isStatusTerminal) return void null

    let socketRef: WebSocket | null = null
    let reconnectDelay: number = INITIAL_WS_RECONNECT_DELAY_MS
    let reconnectAttempt = 0
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let backoffResetTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      const ws = new WebSocket(endpointUrl)

      socketRef = ws

      ws.onopen = () => {
        setIsConnected(true)
        setIsReconnecting(false)
        setIsReconnectLimitReached(false)

        backoffResetTimer = setTimeout(() => {
          reconnectDelay = INITIAL_WS_RECONNECT_DELAY_MS
          reconnectAttempt = 0
        }, STABLE_WS_CONNECTION_DURATION_MS)

        handleConnect()
      }

      ws.onmessage = (event) => {
        try {
          handleMessage(JSON.parse(event.data) as InvoiceWsMessage)
        } catch {
          //* Dropping malformed frames instead of throwing errors from the event handler.
        }
      }

      ws.onclose = () => {
        setIsConnected(false)

        socketRef = null

        if (backoffResetTimer) clearTimeout(backoffResetTimer)

        if (!isReconnectAllowed()) {
          setIsReconnecting(false)
          setIsReconnectSuspended(true)
        } else if (reconnectAttempt >= MAX_WS_RECONNECT_ATTEMPTS) {
          setIsReconnecting(false)
          setIsReconnectLimitReached(true)
        } else {
          const delay = applyReconnectJitter(reconnectDelay)

          reconnectAttempt += 1
          reconnectDelay = Math.min(reconnectDelay * 2, MAX_WS_RECONNECT_DELAY_MS)

          setIsReconnecting(true)

          reconnectTimer = setTimeout(connect, delay)
        }
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (backoffResetTimer) clearTimeout(backoffResetTimer)

      if (socketRef) {
        //* Detaching both handlers prevents further reconnects: `close()` fires `onclose`
        //* asynchronously, and `onerror` still fires after a teardown mid-handshake.
        socketRef.onclose = null
        socketRef.onerror = null

        socketRef.close()
      }

      setIsConnected(false)
      setIsReconnecting(false)
      setIsReconnectLimitReached(false)
      setIsReconnectSuspended(false)
    }
  }, [endpointUrl, isStatusTerminal, connectionAttemptCount])

  const reconnect = useCallback(() => {
    setConnectionAttemptCount((count) => count + 1)
  }, [])

  //* Reconnection halts while the client is offline, and regained connectivity resumes it.
  useEffect(() => {
    if (isClientOnline && isReconnectSuspended) {
      reconnect()
    }
  }, [isClientOnline, isReconnectSuspended, reconnect])

  return { isConnected, isClientOnline, isReconnecting, isReconnectLimitReached, reconnect }
}
