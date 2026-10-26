import { act, cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { resolveCoinIcon } from "@/coin-icons/resolve"

import { CoinIcon } from "./coin-icon"

afterEach(cleanup)

//* Rendering inside an awaited `act` lets React retry the suspended icon before the test reads it.
const renderResolved = async (symbol: string) => {
  const rendered = await act(async () => {
    const result = render(<CoinIcon symbol={symbol} size={24} />)

    await resolveCoinIcon({ symbol, contract: null, network: null })

    return result
  })

  return rendered.container
}

describe("CoinIcon", () => {
  test("renders the icon once it resolves", async () => {
    const container = await renderResolved("btc")

    expect(container.querySelector("svg")).not.toBeNull()
    expect(container.textContent).toBe("")
  })

  test("keeps the ticker mark when there is no icon", async () => {
    const container = await renderResolved("xrg")

    expect(container.querySelector("svg")).toBeNull()
    expect(container.textContent).toBe("xrg")
  })
})
