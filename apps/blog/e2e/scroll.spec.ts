import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

const POST_PATH = "/bitcartcc-versions-0003-and-4-are-out"
const ANCHOR_ID = "one-domain-support"
const SCROLL_AWAY_PX = 1500
const FRAMES_AFTER_HYDRATION = 20

declare global {
  interface Window {
    scrollSamples?: number[]
  }
}

test.describe("Blog: Scroll", () => {
  test("a reload scrolled away from a hashed URL's anchor never shows the anchor", async ({
    page,
  }) => {
    await page.goto(`${POST_PATH}#${ANCHOR_ID}`)
    await waitUntilHydrated(page)

    const anchorY = await page.evaluate(
      (id) => Math.round((document.getElementById(id)?.getBoundingClientRect().top ?? 0) + scrollY),
      ANCHOR_ID,
    )

    //* Two frames let the scroll event reach the router, which saves the position on reload.
    const scrolledY = await page.evaluate(
      (distance) =>
        new Promise<number>((resolve) => {
          scrollBy(0, distance)
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(Math.round(scrollY))))
        }),
      SCROLL_AWAY_PX,
    )

    expect(scrolledY).toBeGreaterThan(anchorY)

    await page.addInitScript(() => {
      window.scrollSamples = []

      const sample = () => {
        window.scrollSamples?.push(Math.round(scrollY))
        requestAnimationFrame(sample)
      }

      requestAnimationFrame(sample)
    })

    await page.reload()
    await waitUntilHydrated(page)

    const samples = await page.evaluate(
      (frames) =>
        new Promise<number[]>((resolve) => {
          let remaining = frames

          const wait = () => {
            if (--remaining > 0) {
              requestAnimationFrame(wait)
            } else resolve(window.scrollSamples ?? [])
          }

          requestAnimationFrame(wait)
        }),
      FRAMES_AFTER_HYDRATION,
    )

    expect(samples.filter((y) => Math.abs(y - anchorY) < 100)).toEqual([])
    expect(samples.at(-1)).toBe(scrolledY)
  })
})
