import { expect, type APIRequestContext } from "@playwright/test"

const SITEMAP_LOC_REGEX = /<loc>\s*([^<]+?)\s*<\/loc>/g

/**
 * Fetches the sitemap and returns the de-duplicated pathnames of its `<loc>`
 * entries. Absolute production origins are stripped so the entries can be
 * requested against the test server (which uses the config `baseURL`).
 */
export const getSitemapEntryPaths = async (
  request: APIRequestContext,
  sitemapPath = "/sitemap.xml",
): Promise<string[]> => {
  const response = await request.get(sitemapPath)

  expect(
    response.ok(),
    `Sitemap is not accessible at "${sitemapPath}" (status ${response.status()})`,
  ).toBe(true)

  const xml = await response.text()
  const paths = new Set<string>()

  for (const [, loc] of xml.matchAll(SITEMAP_LOC_REGEX)) {
    paths.add(new URL(loc).pathname)
  }

  return [...paths]
}

/**
 * Asserts that every URL advertised in the sitemap resolves to a non-error
 * response (status < 400, after following redirects) on the test server.
 *
 * Catches stale routes and broken `customEntries`, e.g. a public asset that is
 * referenced by the sitemap but never emitted by the build.
 */
export const expectAllSitemapEntriesAccessible = async (
  request: APIRequestContext,
  { sitemapPath = "/sitemap.xml" }: { sitemapPath?: string } = {},
): Promise<void> => {
  const paths = await getSitemapEntryPaths(request, sitemapPath)

  expect(paths.length, `Sitemap "${sitemapPath}" contained no <loc> entries`).toBeGreaterThan(0)

  const inaccessibleEntries = await Promise.all(
    paths.map((path) =>
      request.get(path).then((response) => ({ path, status: response.status() })),
    ),
  ).then((results) => results.filter(({ status }) => status >= 400))

  expect(
    inaccessibleEntries.length,

    `Inaccessible sitemap entries:\n${inaccessibleEntries
      .map(({ path, status }) => `  [${status}] ${path}`)
      .join("\n")}`,
  ).toBe(0)
}
