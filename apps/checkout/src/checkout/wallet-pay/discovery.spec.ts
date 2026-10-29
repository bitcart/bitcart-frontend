import { afterEach, describe, expect, test, vi } from "vitest"

import {
  createWalletDiscovery,
  findLegacyWallets,
  selectInjectedWallets,
  watchInjectedWallets,
} from "./discovery"

const ICON = "data:image/svg+xml,%3Csvg%2F%3E"

const announcer = (event: "eip6963" | "TIP6963", uuid: string, info: object = {}) => {
  const provider = { request: vi.fn(() => Promise.resolve([])), tronWeb: false }

  const announce = () =>
    window.dispatchEvent(
      new CustomEvent(`${event}:announceProvider`, {
        detail: Object.freeze({
          info: { uuid, name: "Wallet", icon: ICON, rdns: "x", ...info },
          provider,
        }),
      }),
    )

  window.addEventListener(`${event}:requestProvider`, announce)
  stops.push(() => window.removeEventListener(`${event}:requestProvider`, announce))

  return { provider, announce }
}

const stops: (() => void)[] = []

afterEach(() => {
  for (const stop of stops.splice(0)) stop()
  vi.unstubAllGlobals()
})

const watch = () => {
  const discovery = createWalletDiscovery()

  stops.push(watchInjectedWallets(discovery))

  return discovery
}

describe("watchInjectedWallets", () => {
  test("asks wallets of both standards to announce themselves", () => {
    announcer("eip6963", "evm-wallet")
    announcer("TIP6963", "tron-wallet")

    const { state } = watch()

    expect(selectInjectedWallets(state, "eip155").map(({ id }) => id)).toStrictEqual([
      "eip155:evm-wallet",
    ])

    expect(selectInjectedWallets(state, "tron").map(({ id }) => id)).toStrictEqual([
      "tron:tron-wallet",
    ])
  })

  test("keeps a wallet announcing both standards under one uuid as two wallets", () => {
    announcer("eip6963", "both")
    announcer("TIP6963", "both")

    const { state } = watch()

    expect(state.announced.map(({ family }) => family).sort()).toStrictEqual(["eip155", "tron"])
  })

  test("picks up a wallet announcing itself later", () => {
    const discovery = watch()
    const { announce } = announcer("eip6963", "late")

    announce()

    expect(selectInjectedWallets(discovery.state, "eip155")).toHaveLength(1)
  })

  test("keeps one entry for a wallet that announces itself again", () => {
    const { announce } = announcer("eip6963", "repeat")
    const discovery = watch()
    const listener = vi.fn()

    discovery.subscribe(listener)
    announce()

    expect(discovery.state.announced).toHaveLength(1)
    expect(listener).not.toHaveBeenCalled()
  })

  test("drops an icon that isn't an inline image", () => {
    announcer("eip6963", "remote-icon", { icon: "https://tracker.example/pixel.svg" })

    expect(watch().state.announced[0]?.icon).toBeNull()
  })

  test("ignores an announcement without a provider to call", () => {
    window.addEventListener("eip6963:requestProvider", function announceBroken() {
      window.dispatchEvent(
        new CustomEvent("eip6963:announceProvider", {
          detail: { info: { uuid: "broken", name: "Broken" }, provider: {} },
        }),
      )

      stops.push(() => window.removeEventListener("eip6963:requestProvider", announceBroken))
    })

    expect(watch().state.announced).toStrictEqual([])
  })

  test("stops listening once stopped", () => {
    const discovery = createWalletDiscovery()
    const stop = watchInjectedWallets(discovery)
    const { announce } = announcer("eip6963", "after-stop")

    stop()
    announce()

    expect(discovery.state.announced).toStrictEqual([])
  })
})

describe("selectInjectedWallets", () => {
  test("offers a global wallet only while nothing of its family announces itself", () => {
    vi.stubGlobal("ethereum", { request: vi.fn() })

    const discovery = watch()

    expect(selectInjectedWallets(discovery.state, "eip155")[0]?.id).toBe("legacy:ethereum")

    announcer("eip6963", "announced").announce()

    expect(selectInjectedWallets(discovery.state, "eip155").map(({ id }) => id)).toStrictEqual([
      "eip155:announced",
    ])
  })
})

describe("findLegacyWallets", () => {
  test("finds no wallet on a page without one", () => {
    expect(findLegacyWallets({})).toStrictEqual([])
  })

  test("names TronLink's own provider, and calls it as a TIP-1193 provider", () => {
    const [wallet] = findLegacyWallets({ tron: { isTronLink: true, request: vi.fn() } })

    expect(wallet).toMatchObject({ family: "tron", name: "TronLink" })
    expect(wallet?.family === "tron" && wallet.provider.protocol).toBe("tip1193")
  })

  test("leaves a TronLink-shaped object from another wallet unnamed", () => {
    const [wallet] = findLegacyWallets({ tronLink: { request: vi.fn(), tronWeb: false } })

    expect(wallet?.name).toBeNull()
    expect(wallet?.family === "tron" && wallet.provider.protocol).toBe("legacy")
  })

  test("takes a lone TronWeb, as wallet apps' own browsers inject it", () => {
    const [wallet] = findLegacyWallets({ tronWeb: { trx: {} } })

    expect(wallet?.family === "tron" && wallet.provider.protocol).toBe("bare")
  })

  describe("Trust Wallet", () => {
    const tronWeb = { trx: {} }

    test("names the provider Trust's app also injects as TronLink, once", () => {
      const trustTron = { isTronLink: true, request: vi.fn(), tronWeb }

      const wallets = findLegacyWallets({
        tron: {},
        tronLink: trustTron,
        tronWeb,
        trustwallet: { tron: trustTron },
      })

      expect(wallets).toStrictEqual([
        expect.objectContaining({ family: "tron", name: "Trust Wallet", logoId: "trust" }),
      ])

      expect(wallets[0]?.family === "tron" && wallets[0].provider.protocol).toBe("legacy")
    })

    test("pays through the TronWeb of an app version whose provider has no request", () => {
      const wallets = findLegacyWallets({ tronWeb, trustwallet: { tron: { tronWeb } } })

      expect(wallets).toStrictEqual([expect.objectContaining({ name: "Trust Wallet" })])
      expect(wallets[0]?.family === "tron" && wallets[0].provider.protocol).toBe("bare")
    })

    test("lists the browser extension next to TronLink", () => {
      const wallets = findLegacyWallets({
        tron: { isTronLink: true, request: vi.fn() },
        trustwallet: { tronLink: { request: vi.fn(), tronWeb } },
      })

      expect(wallets.map(({ name }) => name)).toStrictEqual(["Trust Wallet", "TronLink"])
    })
  })
})
