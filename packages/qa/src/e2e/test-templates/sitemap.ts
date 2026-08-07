import type { E2ETestTemplate } from "../types"
import { expectAllSitemapEntriesAccessible } from "../utils"

/**
 * Every URL advertised in the app's sitemap must be reachable (no 4xx/5xx).
 * Requests are issued through the API fixture (no page load) against the run's
 * `baseURL`, so the check is fast and independent of client-side hydration.
 */
export const sitemapEntryReachabilityTest: E2ETestTemplate = async ({ request }) => {
  await expectAllSitemapEntriesAccessible(request)
}
