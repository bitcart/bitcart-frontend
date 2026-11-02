import { afterEach, describe, expect, test, vi } from "vitest"

import { preloadImage } from "./images"

type StubImage = { src: string; srcset: string; sizes: string; decode: () => Promise<void> }

const stubImage = (decode: () => Promise<void>) => {
  const images: StubImage[] = []

  vi.stubGlobal(
    "Image",
    class {
      src = ""
      srcset = ""
      sizes = ""
      decode = decode

      constructor() {
        images.push(this)
      }
    },
  )

  return images
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("preloadImage", () => {
  test("requests the image with the sources an <img> would use", async () => {
    const images = stubImage(() => Promise.resolve())

    await preloadImage(
      { src: "/a.webp", srcSet: "/a.webp 480w", sizes: "50vw" },
      { timeoutMs: 100 },
    )

    expect(images).toMatchObject([{ src: "/a.webp", srcset: "/a.webp 480w", sizes: "50vw" }])
  })

  test("resolves when the image fails to load", async () => {
    stubImage(() => Promise.reject(new Error("broken")))

    await expect(preloadImage({ src: "/a.webp" }, { timeoutMs: 100 })).resolves.toBeUndefined()
  })

  test("resolves after the timeout when the image is slow", async () => {
    vi.useFakeTimers()
    stubImage(() => new Promise<void>(() => undefined))

    const preload = preloadImage({ src: "/a.webp" }, { timeoutMs: 300 })

    await vi.advanceTimersByTimeAsync(300)
    await expect(preload).resolves.toBeUndefined()
  })

  test("clears its timeout once the image is ready", async () => {
    vi.useFakeTimers()
    stubImage(() => Promise.resolve())

    await preloadImage({ src: "/a.webp" }, { timeoutMs: 300 })

    expect(vi.getTimerCount()).toBe(0)
  })

  test("does nothing outside the browser", async () => {
    vi.stubGlobal("Image", undefined)

    await expect(preloadImage({ src: "/a.webp" }, { timeoutMs: 100 })).resolves.toBeUndefined()
  })
})
