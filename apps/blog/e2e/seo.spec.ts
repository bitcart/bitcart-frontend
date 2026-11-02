import { readdirSync } from "node:fs"

import { getSitemapEntryPaths } from "@bitcart/qa/e2e"
import { expect, test, type Page } from "@playwright/test"

import { nodeEnv } from "../node-env.ts"
import { OUTPUT_DIR, SAMPLE_POST, SITE_PAGES } from "./constants"

const { PRODUCTION_BASE_URL } = nodeEnv

const getBuiltAssetUrlPattern = (fileName: string) => {
  const [name, extension] = fileName.split(".")

  return new RegExp(
    `^${RegExp.escape(PRODUCTION_BASE_URL)}/assets/${RegExp.escape(name)}-[\\w-]+\\.${extension}$`,
  )
}

const getJsonLdTypes = async (page: Page) =>
  page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => (JSON.parse(script.textContent) as { "@type": string })["@type"]),
    )

const SEO_CASES = [
  {
    name: "index",
    path: "/",
    canonical: PRODUCTION_BASE_URL,
    ogImage: getBuiltAssetUrlPattern("logo-banner.png"),
    jsonLdTypes: ["Organization", "Blog"],
  },

  {
    name: "category page",
    path: "/category/releases",
    canonical: `${PRODUCTION_BASE_URL}/category/releases`,
    ogImage: getBuiltAssetUrlPattern("logo-banner.png"),
    jsonLdTypes: ["Organization", "BreadcrumbList"],
  },

  {
    name: "post",
    path: SAMPLE_POST.path,
    canonical: `${PRODUCTION_BASE_URL}${SAMPLE_POST.path}`,
    ogImage: getBuiltAssetUrlPattern(SAMPLE_POST.coverFileName),
    jsonLdTypes: ["Organization", "BlogPosting", "BreadcrumbList"],
  },
]

test.describe("Blog: SEO", () => {
  for (const { name, path, canonical, ogImage, jsonLdTypes } of SEO_CASES) {
    test(`the ${name} has its canonical URL, Open Graph tags, JSON-LD and feed link`, async ({
      page,
      request,
    }) => {
      const response = await page.goto(path)

      expect(response?.status()).toBe(200)
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical)
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical)
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", ogImage)

      const ogImageUrl = await page.locator('meta[property="og:image"]').getAttribute("content")

      expect((await request.get(new URL(ogImageUrl ?? "").pathname)).status()).toBe(200)
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /\S/)
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /\S/)
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0)

      await expect(
        page.locator('link[rel="alternate"][type="application/rss+xml"]'),
      ).toHaveAttribute("href", "/rss.xml")

      expect((await getJsonLdTypes(page)).toSorted()).toEqual(jsonLdTypes.toSorted())
    })
  }

  test("an unknown page is a 404 that shows the not-found page", async ({ page }) => {
    const response = await page.goto("/no-such-post")

    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  })

  test("the sitemap lists exactly the prerendered pages", async ({ request }) => {
    const prerenderedPaths = readdirSync(OUTPUT_DIR, { recursive: true, encoding: "utf8" })
      .filter((file) => file.endsWith(".html") && file !== "404.html")
      .map((file) => (file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`))

    const sitemapPaths = await getSitemapEntryPaths(request)

    expect(sitemapPaths.toSorted()).toEqual(prerenderedPaths.toSorted())
    expect(sitemapPaths.toSorted()).toEqual(SITE_PAGES.map(({ path }) => path).toSorted())
  })
})
