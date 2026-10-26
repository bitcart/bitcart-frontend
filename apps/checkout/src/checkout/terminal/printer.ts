import { hasFeature, invoke, type TerminalEnv, type TerminalResult } from "./protocol"

export type TextStyle = "display" | "title" | "heading" | "body" | "small"

export type Span = { text: string; style?: TextStyle; bold?: boolean; code?: boolean }

export type ReceiptBlock =
  | {
      kind: "text"
      text: string
      style?: TextStyle
      bold?: boolean
      code?: boolean
      align?: "left" | "center" | "right"
    }
  | { kind: "qr"; data: string; scale?: number }
  | { kind: "rule" }
  | { kind: "space"; lines?: number }
  | {
      kind: "field"
      label: string | Span
      value: string | Span
      style?: TextStyle
      bold?: boolean
      code?: boolean
    }

export type ReceiptSpec = {
  blocks: ReceiptBlock[]
  copies?: number
}

export const PRINTER_PRINT = "printer.print"

export const hasPrinter = (env: TerminalEnv | null) =>
  env?.capabilities.printer !== undefined && hasFeature(env, PRINTER_PRINT)

export const printReceipt = (spec: ReceiptSpec): Promise<TerminalResult<null>> =>
  invoke<null>(PRINTER_PRINT, spec)
