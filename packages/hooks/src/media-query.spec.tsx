import { act, renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, test, vi } from "vitest"

import { useMediaQuery } from "./media-query"

const mockMatchMedia = (initial: boolean) => {
  let matches = initial
  const listeners = new Set<() => void>()

  vi.stubGlobal(
    "matchMedia",
    vi.fn((media: string) => ({
      media,

      get matches() {
        return matches
      },

      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    })),
  )

  return {
    listeners,

    change: (next: boolean) => {
      matches = next
      for (const listener of listeners) listener()
    },
  }
}

const MediaQueryProbe = () => <span>{String(useMediaQuery("(pointer: coarse)"))}</span>

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("useMediaQuery", () => {
  test("reads the current match", () => {
    mockMatchMedia(true)

    const { result } = renderHook(() => useMediaQuery("(pointer: coarse)"))

    expect(result.current).toBe(true)
  })

  test("follows a change of the match", () => {
    const media = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery("(pointer: coarse)"))

    act(() => media.change(true))

    expect(result.current).toBe(true)
  })

  test("stops listening on unmount", () => {
    const media = mockMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery("(pointer: coarse)"))

    unmount()

    expect(media.listeners.size).toBe(0)
  })

  test("is false during server-side rendering", () => {
    expect(renderToString(<MediaQueryProbe />)).toContain("false")
  })
})
