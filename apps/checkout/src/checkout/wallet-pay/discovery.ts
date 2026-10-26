import { createStore } from "@tanstack/store"

import type { WalletFamily } from "../networks"
import type { Eip1193Request, InjectedTronWeb, InjectedWallet, TronProvider } from "./types"

export type WalletDiscoveryState = {
  announced: InjectedWallet[]
  legacy: InjectedWallet[]
}

export type WalletDiscoveryActions = {
  announce: (wallet: InjectedWallet) => void
  detectLegacy: (wallets: InjectedWallet[]) => void
}

export const createWalletDiscovery = () =>
  createStore<WalletDiscoveryState, WalletDiscoveryActions>(
    { announced: [], legacy: [] },

    ({ setState }) => ({
      announce: (wallet) =>
        setState((state) => {
          const current = state.announced.find(({ id }) => id === wallet.id)

          if (current?.provider === wallet.provider) {
            return state
          } else
            return {
              ...state,
              announced: [...state.announced.filter(({ id }) => id !== wallet.id), wallet],
            }
        }),

      detectLegacy: (wallets) =>
        setState((state) => {
          const isSame =
            wallets.length === state.legacy.length &&
            wallets.every((wallet, index) => wallet.provider === state.legacy[index]?.provider)

          return isSame ? state : { ...state, legacy: wallets }
        }),
    }),
  )

export type WalletDiscovery = ReturnType<typeof createWalletDiscovery>

export const selectInjectedWallets = (
  { announced, legacy }: WalletDiscoveryState,
  family: WalletFamily,
): InjectedWallet[] => {
  const ofFamily = announced.filter((wallet) => wallet.family === family)

  return ofFamily.length > 0 ? ofFamily : legacy.filter((wallet) => wallet.family === family)
}

type AnnouncedInfo = { uuid?: unknown; name?: unknown; icon?: unknown }

type AnnouncedProvider = { request?: unknown; tronWeb?: unknown }

type AnnounceDetail = { info?: AnnouncedInfo; provider?: AnnouncedProvider }

const toIcon = (icon: unknown): string | null =>
  typeof icon === "string" && icon.startsWith("data:image/") ? icon : null

const isRequest = (value: unknown): value is Eip1193Request => typeof value === "function"

const asTronWeb = (value: unknown): InjectedTronWeb | null =>
  typeof value === "object" && value !== null && "trx" in value ? (value as InjectedTronWeb) : null

const toAnnouncedId = (family: WalletFamily, detail: unknown): string =>
  `${family}:${String((detail as AnnounceDetail | undefined)?.info?.uuid)}`

const toAnnouncedWallet = (family: WalletFamily, detail: unknown): InjectedWallet | null => {
  const { info, provider } = (detail ?? {}) as AnnounceDetail

  if (
    typeof info?.uuid !== "string" ||
    typeof info.name !== "string" ||
    !provider ||
    !isRequest(provider.request)
  ) {
    return null
  } else {
    const base = { id: toAnnouncedId(family, detail), name: info.name, icon: toIcon(info.icon) }

    const request: Eip1193Request = (args) =>
      (provider as { request: Eip1193Request }).request(args)

    if (family === "eip155") {
      return { ...base, family, provider: { request } }
    } else
      return {
        ...base,
        family,
        provider: { protocol: "tip1193", request, getTronWeb: () => asTronWeb(provider.tronWeb) },
      }
  }
}

type InjectedGlobals = {
  ethereum?: { request?: unknown }
  tron?: { isTronLink?: unknown; request?: unknown; tronWeb?: unknown }
  tronLink?: { request?: unknown; tronWeb?: unknown }
  tronWeb?: unknown
}

const findLegacyTron = (globals: InjectedGlobals): TronProvider | null => {
  const { tron, tronLink } = globals

  if (tron?.isTronLink && isRequest(tron.request)) {
    const request = tron.request.bind(tron) as Eip1193Request

    return { protocol: "tip1193", request, getTronWeb: () => asTronWeb(tron.tronWeb) }
  } else if (tronLink && isRequest(tronLink.request)) {
    const request = tronLink.request.bind(tronLink) as Eip1193Request

    return { protocol: "legacy", request, getTronWeb: () => asTronWeb(tronLink.tronWeb) }
  } else if (asTronWeb(globals.tronWeb)) {
    return { protocol: "bare", getTronWeb: () => asTronWeb(globals.tronWeb) }
  } else return null
}

export const findLegacyWallets = (globals: InjectedGlobals): InjectedWallet[] => {
  const { ethereum, tron } = globals
  const tronProvider = findLegacyTron(globals)

  return [
    ...(ethereum && isRequest(ethereum.request)
      ? [
          {
            family: "eip155" as const,
            id: "legacy:ethereum",
            name: null,
            icon: null,
            provider: { request: ethereum.request.bind(ethereum) as Eip1193Request },
          },
        ]
      : []),

    ...(tronProvider
      ? [
          {
            family: "tron" as const,
            id: `legacy:tron:${tronProvider.protocol}`,
            name: tron?.isTronLink ? "TronLink" : null,
            icon: null,
            provider: tronProvider,
          },
        ]
      : []),
  ]
}

const ANNOUNCE_EVENTS = {
  eip155: { request: "eip6963:requestProvider", announce: "eip6963:announceProvider" },
  tron: { request: "TIP6963:requestProvider", announce: "TIP6963:announceProvider" },
} as const satisfies Record<WalletFamily, { request: string; announce: string }>

const LEGACY_RECHECK_DELAYS_MS = [500, 2000]

export const watchInjectedWallets = (
  discovery: WalletDiscovery,
  target: Window = window,
): (() => void) => {
  const globals = target as unknown as InjectedGlobals
  const detectLegacy = () => discovery.actions.detectLegacy(findLegacyWallets(globals))

  const listeners = (Object.keys(ANNOUNCE_EVENTS) as WalletFamily[]).map((family) => {
    const announced = new WeakMap<object, InjectedWallet>()

    const listener = (event: Event) => {
      const { detail } = event as CustomEvent<AnnounceDetail | undefined>
      const provider = detail?.provider
      const known = provider ? announced.get(provider) : undefined

      const wallet =
        known?.id === toAnnouncedId(family, detail) ? known : toAnnouncedWallet(family, detail)

      if (wallet && provider) {
        announced.set(provider, wallet)
        discovery.actions.announce(wallet)
      }
    }

    target.addEventListener(ANNOUNCE_EVENTS[family].announce, listener)

    return () => target.removeEventListener(ANNOUNCE_EVENTS[family].announce, listener)
  })

  for (const { request } of Object.values(ANNOUNCE_EVENTS)) {
    target.dispatchEvent(new Event(request))
  }

  detectLegacy()

  const timers = LEGACY_RECHECK_DELAYS_MS.map((delay) => setTimeout(detectLegacy, delay))

  return () => {
    for (const stop of listeners) stop()
    for (const timer of timers) clearTimeout(timer)
  }
}
