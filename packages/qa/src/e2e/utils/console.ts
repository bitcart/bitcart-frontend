import { expect, type ConsoleMessage, type Page } from "@playwright/test"

/**
 * Log levels that constitute a failure. The `console.warn`/`console.error`
 * and browser-emitted resource/network errors all surface through these.
 */
const FAILURE_LOG_LEVELS = new Set(["error", "warning"])

/**
 * A pattern used to recognize an expected console message that should be
 * excluded from the {@link expectNoConsoleMessages} assertion. Strings match by
 * substring; regular expressions match via `.test`. Each pattern is checked
 * against both the message text and its originating URL (so resource-load
 * failures can be ignored by endpoint as well as by message body).
 */
export type ConsoleMessagePattern = string | RegExp

export interface ConsoleMessageTrackingOptions {
  /**
   * Patterns identifying expected console messages to ignore. Use this to
   * suppress known, out-of-scope noise (e.g. a flaky backend endpoint) without
   * masking genuine regressions.
   */
  ignore?: ConsoleMessagePattern[]
}

type CapturedConsoleMessage = { type: string; text: string; url: string }

//* Keyed by `page` so multiple pages can be tracked independently and the
//* captured buffer is reclaimed once the page is garbage-collected.
const trackedConsoleMessages = new WeakMap<Page, CapturedConsoleMessage[]>()

/**
 * Installs `console` and `pageerror` listeners that capture every error/warning
 * emitted by the page for later assertion via {@link expectNoConsoleMessages}.
 *
 * The listeners persist for the lifetime of the `page`,
 * make sure to call {@link expectNoConsoleMessages} after each navigation
 * to drain and assert the messages collected since the previous call.
 */
export const setupFailureConsoleMessageTracking = (page: Page): void => {
  const captured: CapturedConsoleMessage[] = []

  trackedConsoleMessages.set(page, captured)

  page.on("console", (message: ConsoleMessage) => {
    const type = message.type()

    if (FAILURE_LOG_LEVELS.has(type)) {
      captured.push({ type, text: message.text(), url: message.location().url || page.url() })
    }
  })

  page.on("pageerror", (error: Error) => {
    captured.push({ type: "error", text: error.message, url: page.url() })
  })
}

const isIgnored = (
  { text, url }: CapturedConsoleMessage,
  ignore: ConsoleMessagePattern[],
): boolean =>
  ignore.some((pattern) =>
    typeof pattern === "string"
      ? text.includes(pattern) || url.includes(pattern)
      : pattern.test(text) || pattern.test(url),
  )

/**
 * Asserts that no unexpected console errors or warnings were captured since the
 * previous call. Drains the buffer so each navigation is asserted in isolation.
 *
 * Must be called **after** {@link setupFailureConsoleMessageTracking} has been
 * installed, and ideally once the page has settled (hydrated, network idle) so
 * asynchronously-emitted messages are accounted for.
 */
export const expectNoConsoleMessages = (
  page: Page,
  { ignore = [] }: ConsoleMessageTrackingOptions = {},
): void => {
  const captured = trackedConsoleMessages.get(page) ?? []
  const offending = captured.filter((message) => !isIgnored(message, ignore))

  //* Draining buffer for the next navigation
  captured.length = 0

  expect(
    offending.length,

    `Unexpected console messages detected on ${page.url()}:\n${offending
      .map(({ type, text, url }) => `  [${type}] ${text} (${url})`)
      .join("\n")}`,
  ).toBe(0)
}
