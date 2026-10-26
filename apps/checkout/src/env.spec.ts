import { afterEach, describe, expect, test, vi } from "vitest"

const loadApiUrl = async (config: Window["BITCART_CONFIG"]) => {
  vi.stubGlobal("BITCART_CONFIG", config)
  vi.resetModules()

  const { env } = await import("./env")

  return env.BITCART_API_URL
}

describe("env", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  test("takes the API URL from the runtime config", async () => {
    expect(await loadApiUrl({ BITCART_API_URL: "https://pay.example.com/api" })).toBe(
      "https://pay.example.com/api",
    )
  })

  test("falls back to the build-time API URL when the runtime config leaves it empty", async () => {
    vi.stubEnv("BITCART_API_URL", "https://build.example.com/api")

    expect(await loadApiUrl(undefined)).toBe("https://build.example.com/api")
    expect(await loadApiUrl({})).toBe("https://build.example.com/api")
    expect(await loadApiUrl({ BITCART_API_URL: "" })).toBe("https://build.example.com/api")
  })
})
