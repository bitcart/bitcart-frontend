import { act, cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { WalletLogo } from "./wallet-logo"

afterEach(cleanup)

const renderSettled = async (element: React.ReactElement) => {
  const rendered = await act(async () => {
    const result = render(element)

    await import("@web3icons/react/icons/wallets/WalletMetamask")

    return result
  })

  return rendered.container
}

describe("WalletLogo", () => {
  test("renders a known wallet app's logo", async () => {
    const container = await renderSettled(<WalletLogo id="metamask" size={24} />)

    expect(container.querySelector("svg.web3icons")).not.toBeNull()
  })

  test("keeps the neutral mark for an unknown wallet app", async () => {
    const container = await renderSettled(<WalletLogo id="tronlink" size={24} />)

    expect(container.querySelector("span[aria-hidden] > svg.lucide")).not.toBeNull()
    expect(container.querySelector("img")).toBeNull()
  })

  test("prefers the wallet's own image over its id", async () => {
    const src =
      "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E"

    const container = await renderSettled(<WalletLogo src={src} id="metamask" size={24} />)

    expect(container.querySelector("img")?.getAttribute("src")).toBe(src)
  })
})
