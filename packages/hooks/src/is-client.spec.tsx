import { renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { expect, test, describe } from "vitest"

import { useIsClient } from "./is-client"

const IsClientProbe = () => <span>{String(useIsClient())}</span>

describe("useIsClient", () => {
  test("returns true once mounted in a client (jsdom) environment", () => {
    const { result } = renderHook(() => useIsClient())

    expect(result.current).toBe(true)
  })

  test("returns false during server-side rendering", () => {
    //* useSyncExternalStore picks the server snapshot (false) when there is no client store.
    expect(renderToString(<IsClientProbe />)).toContain("false")
  })
})
