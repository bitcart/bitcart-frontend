import { describe, expect, test } from "vitest"

import { resolveCoinIcon } from "./resolve"

const USDT_ON_ETHEREUM = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const USDT_ON_TRON = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
const TRON = "tron:728126428"

describe("resolveCoinIcon", () => {
  test("finds a native coin's icon by its symbol, in any case", async () => {
    expect(await resolveCoinIcon({ symbol: "btc", contract: null, network: null })).not.toBeNull()
  })

  test("finds a token's icon by its contract, whatever the address's case", async () => {
    const icon = await resolveCoinIcon({
      symbol: "usdt",
      contract: USDT_ON_ETHEREUM,
      network: "eip155:1",
    })

    expect(icon).not.toBeNull()
  })

  test("names a token's icon by its contract, not its ticker", async () => {
    const byContract = await resolveCoinIcon({
      symbol: "anything",
      contract: USDT_ON_ETHEREUM.toLowerCase(),
      network: "eip155:1",
    })

    expect(byContract).toBe(
      await resolveCoinIcon({ symbol: "usdt", contract: null, network: null }),
    )
  })

  test("finds a TRC-20 token's icon by its base58 contract", async () => {
    expect(
      await resolveCoinIcon({ symbol: "anything", contract: USDT_ON_TRON, network: TRON }),
    ).toBe(await resolveCoinIcon({ symbol: "usdt", contract: null, network: null }))
  })

  test("matches a TRON contract only in its exact case", async () => {
    const lowercased = USDT_ON_TRON.toLowerCase()

    expect(
      await resolveCoinIcon({ symbol: "usdt", contract: lowercased, network: TRON }),
    ).toBeNull()
  })

  test.each([
    [
      "an unknown contract",
      { contract: "0x0000000000000000000000000000000000000001", network: "eip155:1" },
    ],
    ["a contract on an unindexed chain", { contract: USDT_ON_ETHEREUM, network: "eip155:10" }],
    ["a contract without a chain", { contract: USDT_ON_ETHEREUM, network: null }],
  ])("finds no icon for a token with %s, even with a known ticker", async (_, token) => {
    expect(await resolveCoinIcon({ symbol: "usdt", ...token })).toBeNull()
  })

  test("finds no icon for a coin web3icons lacks", async () => {
    expect(await resolveCoinIcon({ symbol: "xrg", contract: null, network: null })).toBeNull()
  })
})
