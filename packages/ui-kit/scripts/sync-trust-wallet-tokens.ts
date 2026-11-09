//* Pins the metadata of the active tokens in Trust Wallet's assets registry, at a commit or branch
//* of it (`master` by default), into `data/trust-wallet-tokens.gen.json`.
//* `generate-coin-icons.ts` reads it to find the web3icons icon of contracts web3icons doesn't list.

import { execFile } from "node:child_process"
import { lstat, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"

import { normalizeTokenAddress } from "../src/coin-icons/shards"
import {
  COIN_ICON_NETWORKS,
  TRUST_WALLET_TOKENS_PATH,
  type CoinIconNetwork,
  type TrustWalletToken,
  type TrustWalletTokens,
} from "./coin-icon-sources"

const REGISTRY_URL = "https://github.com/trustwallet/assets.git"
const COINGECKO_HOSTS = new Set(["coingecko.com", "www.coingecko.com"])
const COINGECKO_COIN_PATH = /^\/(?:[a-z-]+\/)?coins\/([a-z0-9-]+)\/?$/u

const run = promisify(execFile)

// needed to fetch only parts of their big repo
const fetchRegistry = async (checkout: string, ref: string) => {
  const git = async (...args: string[]) =>
    (await run("git", ["-C", checkout, ...args])).stdout.trim()

  await git("init", "--quiet")
  await git("remote", "add", "origin", REGISTRY_URL)
  await git("config", "core.symlinks", "false")

  await git(
    "sparse-checkout",
    "set",
    "--no-cone",
    ...COIN_ICON_NETWORKS.map(
      ({ trustWalletFolder }) => `/blockchains/${trustWalletFolder}/assets/*/info.json`,
    ),
  )

  await git("fetch", "--quiet", "--depth=1", "--filter=blob:none", "origin", ref)
  await git("checkout", "--quiet", "FETCH_HEAD")

  return git("rev-parse", "FETCH_HEAD")
}

const getCoingeckoId = (links: unknown): string | undefined => {
  const link = Array.isArray(links)
    ? (links as { name?: unknown; url?: unknown }[]).find(({ name }) => name === "coingecko")
    : undefined

  const url = typeof link?.url === "string" && URL.canParse(link.url) ? new URL(link.url) : null

  return url !== null && COINGECKO_HOSTS.has(url.hostname)
    ? COINGECKO_COIN_PATH.exec(url.pathname)?.[1]
    : undefined
}

const parseJson = (source: string): unknown => {
  try {
    return JSON.parse(source)
  } catch {
    return null
  }
}

const readToken = async (infoPath: string): Promise<TrustWalletToken | null> => {
  const isFile = (await lstat(infoPath).catch(() => null))?.isFile() ?? false
  const info = isFile ? parseJson(await readFile(infoPath, "utf8")) : null

  if (info === null || typeof info !== "object") {
    return null
  } else {
    const { status, symbol, name, links } = info as Record<string, unknown>
    const coingeckoId = getCoingeckoId(links)

    return status === "active" &&
      typeof symbol === "string" &&
      symbol.trim() !== "" &&
      typeof name === "string"
      ? { symbol, name, ...(coingeckoId === undefined ? {} : { coingeckoId }) }
      : null
  }
}

const readNetworkTokens = async (checkout: string, network: CoinIconNetwork) => {
  const assets = join(checkout, "blockchains", network.trustWalletFolder, "assets")
  const tokens = new Map<string, TrustWalletToken>()

  for (const folder of await readdir(assets)) {
    const address = normalizeTokenAddress(network.network, folder)

    const token = network.address.test(address)
      ? await readToken(join(assets, folder, "info.json"))
      : null

    if (token !== null && !tokens.has(address)) {
      tokens.set(address, token)
    }
  }

  return Object.fromEntries([...tokens].toSorted(([a], [b]) => (a < b ? -1 : 1)))
}

//* One token per line keeps a re-sync's diff readable.
const serialize = ({ commit, tokensByNetwork }: TrustWalletTokens) =>
  `{\n  "commit": ${JSON.stringify(commit)},\n  "tokensByNetwork": {\n${Object.entries(
    tokensByNetwork,
  )
    .map(
      ([network, tokens]) =>
        `    ${JSON.stringify(network)}: {\n${Object.entries(tokens)
          .map(([address, token]) => `      ${JSON.stringify(address)}: ${JSON.stringify(token)}`)
          .join(",\n")}\n    }`,
    )
    .join(",\n")}\n  }\n}\n`

const ref = process.argv[2] ?? "master"

//! Git would read a ref starting with a dash as an option.
if (ref.startsWith("-")) {
  throw new Error(`trust-wallet-tokens: "${ref}" is not a commit or branch`)
}

const checkout = await mkdtemp(join(tmpdir(), "trust-wallet-assets-"))

try {
  console.log(`trust-wallet-tokens: fetching ${REGISTRY_URL} at ${ref}`)

  const tokens: TrustWalletTokens = {
    commit: await fetchRegistry(checkout, ref),

    tokensByNetwork: Object.fromEntries(
      await Promise.all(
        COIN_ICON_NETWORKS.map(async (network) => [
          network.network,
          await readNetworkTokens(checkout, network),
        ]),
      ),
    ),
  }

  await writeFile(TRUST_WALLET_TOKENS_PATH, serialize(tokens))

  console.log(
    `trust-wallet-tokens: ${tokens.commit}; ${Object.entries(tokens.tokensByNetwork)
      .map(([network, entries]) => `${Object.keys(entries).length} on ${network}`)
      .join(", ")}`,
  )
} finally {
  await rm(checkout, { recursive: true, force: true })
}
