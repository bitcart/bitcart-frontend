import { expect, test } from "@playwright/test"

import { EMPTY_CATEGORY_PATHS, SITE_PAGES } from "./constants"

test.describe("Blog: Routes", () => {
  test("every old path resolves without a trailing slash", async ({ request }) => {
    for (const { path } of SITE_PAGES) {
      const response = await request.get(path, { maxRedirects: 0 })

      expect(response.status(), path).toBe(200)
    }
  })

  //* The status is the host's: Netlify answers 301, the preview server 307.
  test("an old path with a trailing slash redirects to the path without it", async ({
    request,
  }) => {
    for (const { path } of SITE_PAGES.filter((page) => page.path !== "/")) {
      const response = await request.get(`${path}/`, { maxRedirects: 0 })

      expect(response.status(), path).toBeGreaterThanOrEqual(300)
      expect(response.status(), path).toBeLessThan(400)
      expect(response.headers().location, path).toBe(path)
    }
  })

  test("a category without posts is a 404", async ({ request }) => {
    for (const path of EMPTY_CATEGORY_PATHS) {
      expect((await request.get(path)).status(), path).toBe(404)
    }
  })
})
