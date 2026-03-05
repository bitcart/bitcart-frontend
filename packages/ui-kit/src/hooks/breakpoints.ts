import type { BreakpointKey } from "@bitcart/unocss-preset"
import { useCallback, useSyncExternalStore } from "react"

export const useCurrentBreakpoint = (): BreakpointKey => {
  const subscribe = useCallback((onStoreChange: VoidFunction) => {
    window.addEventListener("resize", onStoreChange)

    return () => window.removeEventListener("resize", onStoreChange)
  }, [])

  const getSnapshot = useCallback(
    () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--current-breakpoint")
        .trim() as BreakpointKey,

    [],
  )

  const getServerSnapshot: () => BreakpointKey = useCallback(() => "sm", [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
