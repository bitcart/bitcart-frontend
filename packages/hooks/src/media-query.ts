import { useCallback, useSyncExternalStore } from "react"
import { constant } from "remeda"

export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)

      list.addEventListener("change", onChange)

      return () => list.removeEventListener("change", onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, constant(false))
}
