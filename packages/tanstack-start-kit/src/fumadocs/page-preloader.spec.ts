import { describe, expect, test, vi } from "vitest"

import { createPagePreloader } from "./page-preloader"

const COLLECTION = {
  raw: {
    "./index.mdx": null,
    "./post.mdx": null,
    "./guides/index.mdx": null,
    "./guides/setup.mdx": null,
    "./(reference)/api.mdx": null,
  },
}

const setup = (baseUrl?: string) => {
  const clientLoader = { preload: vi.fn(() => Promise.resolve()) }

  return { clientLoader, preloadPageAt: createPagePreloader(COLLECTION, clientLoader, baseUrl) }
}

describe("createPagePreloader", () => {
  test.each([
    ["/", "index.mdx"],
    ["/post", "post.mdx"],
    ["/guides", "guides/index.mdx"],
    ["/guides/", "guides/index.mdx"],
    ["/guides/setup", "guides/setup.mdx"],
    ["/api", "(reference)/api.mdx"],
  ])("preloads the page at %s", async (pathname, path) => {
    const { clientLoader, preloadPageAt } = setup()

    await preloadPageAt(pathname)

    expect(clientLoader.preload).toHaveBeenCalledExactlyOnceWith(path)
  })

  test("skips a path without a page", async () => {
    const { clientLoader, preloadPageAt } = setup()

    await preloadPageAt("/missing")

    expect(clientLoader.preload).not.toHaveBeenCalled()
  })

  test("resolves pages under a base URL and skips paths outside it", async () => {
    const { clientLoader, preloadPageAt } = setup("/docs")

    await preloadPageAt("/docs")
    await preloadPageAt("/docs/guides/setup")
    await preloadPageAt("/docsy")
    await preloadPageAt("/post")

    expect(clientLoader.preload.mock.calls).toEqual([["index.mdx"], ["guides/setup.mdx"]])
  })
})
