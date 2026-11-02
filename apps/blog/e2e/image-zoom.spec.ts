import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test } from "@playwright/test"

const FIGURES_POST_PATH = "/bitcartcc-updates-summary-august-2020"
const GALLERY_POST_PATH = "/bitcartcc-version-0600-is-out"
const SMALL_IMAGE_NAME = /admin, store and backend ports/

test.describe("Blog: Image zoom", () => {
  test("an image narrower than the column keeps its own width", async ({ page }) => {
    await page.goto(FIGURES_POST_PATH)
    await waitUntilHydrated(page)

    const figure = page.locator("[data-slot=figure-image]", {
      has: page.getByRole("img", { name: SMALL_IMAGE_NAME }),
    })

    await figure.scrollIntoViewIfNeeded()

    const { renderedWidth, ownWidth } = await figure
      .getByRole("img")
      .evaluate((image: HTMLImageElement) => ({
        renderedWidth: image.offsetWidth,
        ownWidth: Number(image.getAttribute("width")),
      }))

    expect(renderedWidth).toBe(ownWidth)
  })

  test("the viewer enlarges an image at most twice its own size", async ({ page }) => {
    await page.goto(FIGURES_POST_PATH)
    await waitUntilHydrated(page)

    const trigger = page.getByRole("button", { name: SMALL_IMAGE_NAME })

    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()

    const zoomedImage = page.getByRole("dialog").getByRole("img")
    const ownWidth = Number(await zoomedImage.getAttribute("width"))

    await expect
      .poll(() => zoomedImage.evaluate((image) => image.getBoundingClientRect().width))
      .toBeCloseTo(ownWidth * 2, 0)
  })

  test("an image already filling a phone screen doesn't zoom, a gallery's still do", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(GALLERY_POST_PATH)
    await waitUntilHydrated(page)

    const singleImages = page.locator("figure:not(:has([data-slot=figure-gallery]))")
    const galleryImages = page.locator("[data-slot=figure-gallery] [data-slot=figure-image]")

    //* Waits for the gallery's buttons first, so the single images' absence isn't checked too early.
    await expect(galleryImages.getByRole("button")).toHaveCount(await galleryImages.count())
    await expect(singleImages.getByRole("button", { name: /^Enlarge image/ })).toHaveCount(0)
  })

  test("a scaled-down image opens its largest file and closes back to its trigger", async ({
    page,
  }) => {
    await page.goto(FIGURES_POST_PATH)
    await waitUntilHydrated(page)

    const trigger = page.getByRole("button", { name: /^Enlarge image: Notification Providers/ })

    await trigger.scrollIntoViewIfNeeded()
    await trigger.focus()
    await page.keyboard.press("Enter")

    const viewer = page.getByRole("dialog", { name: /^Notification Providers/ })

    await expect(viewer).toBeVisible()
    await expect(viewer.getByRole("img")).toHaveJSProperty("naturalWidth", 1280)

    await page.keyboard.press("Escape")

    await expect(viewer).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("a gallery's images are browsed in order", async ({ page }) => {
    await page.goto(GALLERY_POST_PATH)
    await waitUntilHydrated(page)

    const triggers = page.locator("[data-slot=figure-gallery]").getByRole("button")

    await triggers.first().scrollIntoViewIfNeeded()
    await triggers.first().click()

    const viewer = page.getByRole("dialog")
    const position = viewer.locator("[aria-live=polite]")

    await expect(position).toHaveText(/^1 of \d+$/)
    await expect(viewer.getByRole("button", { name: "Previous image" })).toBeDisabled()

    await page.keyboard.press("ArrowRight")
    await expect(position).toHaveText(/^2 of \d+$/)

    await viewer.getByRole("button", { name: "Next image" }).click()
    await expect(position).toHaveText(/^3 of \d+$/)

    //* Outside the image and the controls, so the press lands on the backdrop.
    await page.mouse.click(10, 300)

    await expect(viewer).toBeHidden()
    await expect(triggers.nth(2)).toBeFocused()
  })
})
