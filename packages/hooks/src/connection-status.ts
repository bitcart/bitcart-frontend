import { useWindowEvent } from "@mantine/hooks"
import { useState } from "react"

import { useIsClient } from "./is-client"

/**
 * Reports whether the browser has network connectivity.
 *
 * Rendering on the server yields `true`, keeping the first client render in agreement with the
 * markup.
 */
export const useIsOnline = (): boolean => {
  const isClient = useIsClient()
  const [value, setValue] = useState<boolean | null>(null)

  useWindowEvent("online", () => setValue(true))
  useWindowEvent("offline", () => setValue(false))

  //* The events fire on transitions only.
  return value ?? (isClient ? navigator.onLine : true)
}
