import { useState, useSyncExternalStore } from "react"

import type { TerminalErrorCode } from "./errors"
import { hasPrinter, printReceipt, type ReceiptSpec } from "./printer"
import { subscribeTerminalEnv, terminalEnv, type TerminalEnv } from "./protocol"

export const useTerminalEnv = (): TerminalEnv | null =>
  useSyncExternalStore(subscribeTerminalEnv, terminalEnv, () => null)

export const useCanOpenExternalLinks = (): boolean => useTerminalEnv() === null

export type PrintState =
  | { status: "idle" | "printing" | "printed" }
  | { status: "failed"; code: TerminalErrorCode; diagnostic?: string }

export const usePrinter = () => {
  const env = useTerminalEnv()
  const [state, setState] = useState<PrintState>({ status: "idle" })

  const print = async (spec: ReceiptSpec) => {
    setState({ status: "printing" })

    const result = await printReceipt(spec)

    setState(
      result.ok
        ? { status: "printed" }
        : { status: "failed", code: result.code, diagnostic: result.diagnostic },
    )
  }

  return { isAvailable: hasPrinter(env), state, print }
}
