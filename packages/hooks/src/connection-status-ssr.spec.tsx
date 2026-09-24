/** @vitest-environment node */

import { renderToString } from "react-dom/server"
import { describe, expect, test } from "vitest"

import { useIsOnline } from "./connection-status"

const IsOnlineProbe = () => <span>{String(useIsOnline())}</span>

describe("useIsOnline (server)", () => {
  test("reports a connected client without reading DOM globals", () => {
    expect(globalThis.window).toBeUndefined()
    expect(renderToString(<IsOnlineProbe />)).toContain("true")
  })
})
