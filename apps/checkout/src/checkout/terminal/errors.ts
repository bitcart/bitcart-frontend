import type { MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"

const TERMINAL_ERROR_CODES = [
  "PRINTER_NOT_PRESENT",
  "PRINTER_OUT_OF_PAPER",
  "PRINTER_COVER_OPEN",
  "PRINTER_OVERHEATED",
  "PRINTER_BUSY",
  "PRINTER_LOW_VOLTAGE",
  "PRINTER_HARDWARE_FAULT",
  "PERMISSION_DENIED",
  "SERVICE_UNAVAILABLE",
  "PAYLOAD_INVALID",
  "TIMEOUT",
  "UNSUPPORTED",
  "UNKNOWN",
] as const

export type TerminalErrorCode = (typeof TERMINAL_ERROR_CODES)[number]

export const asTerminalErrorCode = (raw: string | undefined): TerminalErrorCode =>
  TERMINAL_ERROR_CODES.find((code) => code === raw) ?? "UNKNOWN"

type PrintErrorCopy = {
  title: MessageDescriptor
  action: MessageDescriptor
  retryable: boolean
  showDiagnostic: boolean
}

export const PRINT_ERROR_COPY: Record<TerminalErrorCode, PrintErrorCopy> = {
  PRINTER_NOT_PRESENT: {
    title: msg`No printer on this device`,
    action: msg`This terminal has no receipt printer.`,
    retryable: false,
    showDiagnostic: false,
  },

  PRINTER_OUT_OF_PAPER: {
    title: msg`Out of paper`,
    action: msg`Load a new roll, then print again.`,
    retryable: true,
    showDiagnostic: false,
  },

  PRINTER_COVER_OPEN: {
    title: msg`Printer cover is open`,
    action: msg`Close the paper compartment, then print again.`,
    retryable: true,
    showDiagnostic: false,
  },

  PRINTER_OVERHEATED: {
    title: msg`Printer is too hot`,
    action: msg`Wait for it to cool down, then print again.`,
    retryable: true,
    showDiagnostic: false,
  },

  PRINTER_BUSY: {
    title: msg`Printer is busy`,
    action: msg`Another receipt is still printing. Try again shortly.`,
    retryable: true,
    showDiagnostic: false,
  },

  PRINTER_LOW_VOLTAGE: {
    title: msg`Battery too low to print`,
    action: msg`Connect the terminal to power, then print again.`,
    retryable: true,
    showDiagnostic: false,
  },

  PRINTER_HARDWARE_FAULT: {
    title: msg`Printer fault`,
    action: msg`Restart the terminal. If it keeps failing, contact support.`,
    retryable: true,
    showDiagnostic: true,
  },

  PERMISSION_DENIED: {
    title: msg`Printing isn't permitted`,
    action: msg`This app isn't allowed to use the printer. Contact support.`,
    retryable: false,
    showDiagnostic: true,
  },

  SERVICE_UNAVAILABLE: {
    title: msg`Printer service unavailable`,
    action: msg`Restart the terminal. If it keeps failing, contact support.`,
    retryable: true,
    showDiagnostic: true,
  },

  PAYLOAD_INVALID: {
    title: msg`The receipt couldn't be prepared`,
    action: msg`Try again. If it keeps failing, contact support.`,
    retryable: true,
    showDiagnostic: true,
  },

  TIMEOUT: {
    title: msg`The printer didn't respond`,
    action: msg`Check the terminal, then print again.`,
    retryable: true,
    showDiagnostic: true,
  },

  UNSUPPORTED: {
    title: msg`Printing isn't available here`,
    action: msg`This terminal's software doesn't support printing receipts.`,
    retryable: false,
    showDiagnostic: false,
  },

  UNKNOWN: {
    title: msg`The receipt couldn't be printed`,
    action: msg`Try again. If it keeps failing, contact support with the code below.`,
    retryable: true,
    showDiagnostic: true,
  },
}
