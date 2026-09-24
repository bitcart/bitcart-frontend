import { act, renderHook } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { useIsOnline } from "./connection-status"

const mockNavigatorStatus = (isOnline: boolean) => {
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline)
}

const dispatchWindowEvent = (type: "online" | "offline") => {
  act(() => {
    window.dispatchEvent(new Event(type))
  })
}

describe("useIsOnline", () => {
  describe("initial status", () => {
    test("reads `navigator.onLine` once mounted", () => {
      mockNavigatorStatus(false)

      const { result } = renderHook(() => useIsOnline())

      expect(result.current).toBe(false)
    })

    test("reports a connected browser as online", () => {
      mockNavigatorStatus(true)

      const { result } = renderHook(() => useIsOnline())

      expect(result.current).toBe(true)
    })
  })

  describe("transitions", () => {
    test("reports offline once the `offline` event fires", () => {
      mockNavigatorStatus(true)

      const { result } = renderHook(() => useIsOnline())

      dispatchWindowEvent("offline")

      expect(result.current).toBe(false)
    })

    test("reports online once the `online` event fires", () => {
      mockNavigatorStatus(false)

      const { result } = renderHook(() => useIsOnline())

      dispatchWindowEvent("online")

      expect(result.current).toBe(true)
    })

    test("tracks repeated transitions", () => {
      mockNavigatorStatus(true)

      const { result } = renderHook(() => useIsOnline())

      dispatchWindowEvent("offline")
      dispatchWindowEvent("online")
      dispatchWindowEvent("offline")

      expect(result.current).toBe(false)
    })

    test("keeps the reported status when `navigator.onLine` disagrees", () => {
      mockNavigatorStatus(true)

      const { result } = renderHook(() => useIsOnline())

      dispatchWindowEvent("offline")

      expect(navigator.onLine).toBe(true)
      expect(result.current).toBe(false)
    })
  })
})
