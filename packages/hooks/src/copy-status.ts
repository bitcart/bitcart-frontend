import { useCallback, useEffect, useState } from "react"

const STATUS_DURATION_MS = 2000

export type CopyOutcome = "copied" | "failed"

export type CopyStatus<TKey extends string> = { key: TKey; outcome: CopyOutcome } | null

//* For contexts without the async Clipboard API, such as an insecure origin
//! Selecting the text moves focus, so it goes back to the pressed control afterwards. iOS only
//! copies a range set with `setSelectionRange`.
const copyThroughSelection = (value: string) => {
  const field = document.createElement("textarea")
  const focused = document.activeElement

  field.value = value
  field.setAttribute("readonly", "")
  field.style.position = "fixed"
  field.style.opacity = "0"
  document.body.append(field)
  field.select()
  field.setSelectionRange(0, value.length)

  try {
    return document.execCommand("copy")
  } catch {
    return false
  } finally {
    field.remove()

    if (focused instanceof HTMLElement) focused.focus({ preventScroll: true })
  }
}

/**
 * Copies values to the clipboard and reports the last outcome, under the key it was copied with,
 * for about two seconds.
 *
 * @example
 * ```tsx
 * const { status, copy } = useCopyStatus<"address" | "amount">()
 * <button onClick={() => copy("address", address)}>
 *   {status?.key === "address" ? status.outcome : "Copy"}
 * </button>
 * ```
 */
export const useCopyStatus = <TKey extends string>(): {
  status: CopyStatus<TKey>
  copy: (key: TKey, value: string) => void
} => {
  const [status, setStatus] = useState<CopyStatus<TKey>>(null)

  useEffect(() => {
    if (status === null) return void null

    const timeout = setTimeout(() => setStatus(null), STATUS_DURATION_MS)

    return () => clearTimeout(timeout)
  }, [status])

  const copy = useCallback((key: TKey, value: string) => {
    const report = (isCopied: boolean) =>
      setStatus({ key, outcome: isCopied ? "copied" : "failed" })

    if (navigator.clipboard === undefined) {
      report(copyThroughSelection(value))
    } else {
      navigator.clipboard.writeText(value).then(
        () => report(true),
        () => report(copyThroughSelection(value)),
      )
    }
  }, [])

  return { status, copy }
}
