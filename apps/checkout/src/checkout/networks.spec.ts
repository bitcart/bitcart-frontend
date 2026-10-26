import { describe, expect, test } from "vitest"

import { getMethodNetwork, getNetworkLabels, parseWalletNetwork } from "./networks"

describe("parseWalletNetwork", () => {
  test.each([
    ["eip155:1", { family: "eip155", chainId: 1 }],
    ["tron:728126428", { family: "tron", chainId: 728126428 }],
  ])("reads %s", (caip2, network) => {
    expect(parseWalletNetwork(caip2)).toStrictEqual(network)
  })

  test.each([null, "bip122:000000000019d6689c085ae165831e93", "eip155:", "eip155:1:extra"])(
    "covers no network from %j",
    (caip2) => {
      expect(parseWalletNetwork(caip2)).toBeNull()
    },
  )
})

describe("getNetworkLabels", () => {
  test("names a known network", () => {
    expect(getNetworkLabels("eip155:56")).toStrictEqual({ badge: "BSC", name: "BNB Smart Chain" })
  })

  test("badges an unknown network with its chain id, leaving it unnamed", () => {
    expect(getNetworkLabels("eip155:43114")).toStrictEqual({ badge: "43114", name: null })
  })
})

describe("getMethodNetwork", () => {
  test("prefers the backend's network", () => {
    expect(getMethodNetwork({ network: "tron:728126428", chainId: 1 })).toBe("tron:728126428")
  })

  test("falls back to the chain id of an EIP-681 payment URI", () => {
    expect(getMethodNetwork({ network: null, chainId: 137 })).toBe("eip155:137")
  })

  test("has no network without either", () => {
    expect(getMethodNetwork({ network: null, chainId: null })).toBeNull()
  })
})
