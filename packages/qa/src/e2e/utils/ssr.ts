import type { Page } from "@playwright/test"

import { LAYOUT_CONTAINER_TESTID } from "@/common"

/**
 * Waits until React has fully hydrated the page by checking for the
 * `data-is-hydrated="true"` attribute on the layout container element.
 */
export const waitUntilHydrated = (page: Page) =>
  page.locator(`[data-testid="${LAYOUT_CONTAINER_TESTID}"][data-is-hydrated="true"]`).waitFor()
