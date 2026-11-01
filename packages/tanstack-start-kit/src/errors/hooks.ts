import { useRouter } from "@tanstack/react-router"
import { useCallback } from "react"

/**
 * Retries a route that failed: resets its error boundary and reruns its loaders.
 *
 * @param reset The `reset` prop of the route's `errorComponent`.
 */
export const useRouteErrorRetry = (reset: () => void): (() => void) => {
  const router = useRouter()

  return useCallback(() => {
    reset()
    void router.invalidate()
  }, [reset, router])
}
