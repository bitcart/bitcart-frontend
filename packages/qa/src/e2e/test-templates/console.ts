import type { PageRoutePath } from "@/common"

import type { GenericE2ETestTemplate } from "../types"
import {
  type ConsoleMessageTrackingOptions,
  expectNoConsoleMessages,
  setupFailureConsoleMessageTracking,
  waitUntilHydrated,
} from "../utils"

/**
 * A single page must load and hydrate without emitting any console errors or
 * warnings. Intended to be instantiated once per route: loop over the page
 * catalog at the spec level so each page gets its own test (isolated timeout,
 * concurrency-friendly), mirroring the screenshots spec.
 *
 * Pass {@link ConsoleMessageTrackingOptions.ignore} to ignore known,
 * out-of-scope noise (e.g. an unstable backend endpoint) so it does not fail
 * the suite while still catching every other unexpected message.
 */
export const createNoConsoleMessagesTest: GenericE2ETestTemplate<
  { path: PageRoutePath } & ConsoleMessageTrackingOptions
> =
  ({ path, ignore }) =>
  async ({ page }) => {
    setupFailureConsoleMessageTracking(page)

    await page.goto(path)
    await waitUntilHydrated(page)
    expectNoConsoleMessages(page, { ignore })
  }
