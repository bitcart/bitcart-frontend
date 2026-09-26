import { toast } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { useClipboard } from "@mantine/hooks"
import { useEffect, useRef } from "react"

/**
 * Copies a payment value and announces the outcome with a toast, for copy actions without a
 * visible field to confirm the copy. Requires a mounted toast host.
 */
export const useCheckoutCopy = (): ((value: string, label: string) => void) => {
  const { copy, copied, error, reset } = useClipboard()
  const labelRef = useRef("")

  useEffect(() => {
    if (copied) toast.success(t`${labelRef.current} copied`)
  }, [copied])

  useEffect(() => {
    if (error) toast.error(t`Couldn't copy. Please copy it manually.`)
  }, [error])

  return (value, label) => {
    labelRef.current = label

    reset()
    copy(value)
  }
}
