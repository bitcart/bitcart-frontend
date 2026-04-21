import { expect, type Page } from "@playwright/test"

type GlobalContext = { __uncompiledLocaleMessageIds?: Set<string> }

/**
 * Injects a `console.warn` interceptor that captures Lingui's
 * "Uncompiled message detected!" warnings and stores the leaked message IDs
 * in `window.__uncompiledLocaleMessageIds`.
 *
 * Must be called **before the first page navigation**. Once installed it
 * persists across all page loads (both full reloads and client-side) for the
 * lifetime of the `page` object. Call {@link expectNoUncompiledLocaleMessageIds} after
 * each navigation to drain and assert the collected IDs.
 *
 * **Implementation note:** The warning regex is inlined as a literal rather
 * than imported because `page.addInitScript` serializes the callback via
 * `.toString()` and evaluates it in the browser — Node module-scope variables
 * are not available in that context.
 */
export const setupUncompiledLocaleMessageTracking = async (page: Page) => {
  await page.addInitScript(() => {
    const ctx = window as GlobalContext

    ctx.__uncompiledLocaleMessageIds = new Set()

    const warn = console.warn.bind(console)

    console.warn = (...args: unknown[]) => {
      // Lingui emits this warning when a message has no catalog entry.
      // Regex must be inlined — see JSDoc above.
      const match = String(args[0]).match(/Uncompiled message detected! Message:\n\n> (.+)/)

      if (match?.[1]) {
        ctx.__uncompiledLocaleMessageIds?.add(match[1])
      }

      warn(...args)
    }
  })
}

/**
 * Asserts that no translation catalog message IDs are visible on the page.
 *
 * Must be called on a pseudo locale page (`/pseudo/...`) **after**
 * {@link setupUncompiledLocaleMessageTracking} has been installed. Drains the IDs
 * collected since the last call (or since the last full page load).
 */
export const expectNoUncompiledLocaleMessageIds = async (page: Page) => {
  const uncompiledMessageIds = await page.evaluate(() => {
    const ctx = window as GlobalContext
    const ids = [...(ctx.__uncompiledLocaleMessageIds ?? [])]

    ctx.__uncompiledLocaleMessageIds = new Set()

    return ids
  })

  expect(
    uncompiledMessageIds.length,
    `Uncompiled locale catalog message ID were detected: "${uncompiledMessageIds.join(
      '", "',
    )}". Run \`just locales-extract-dev\` to refresh i18n catalogs.`,
  ).toBe(0)
}
