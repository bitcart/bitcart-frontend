/** @vitest-environment node */

import { renderToString } from "react-dom/server"
import { describe, expect, test } from "vitest"

import { useCountdown } from "./countdown"

const CountdownProbe = () => <span>{useCountdown(125).formatted}</span>

describe("useCountdown (server)", () => {
  test("renders its starting value without reading DOM globals", () => {
    expect(globalThis.window).toBeUndefined()
    expect(renderToString(<CountdownProbe />)).toContain("02:05")
  })
})
