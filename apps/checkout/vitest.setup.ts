import "@testing-library/jest-dom/vitest"
import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { mockLayoutApis, mockMatchMedia } from "@bitcart/qa/unit"
import { toast } from "@bitcart/ui-kit/utils"
import { i18n } from "@lingui/core"
import { cleanup } from "@testing-library/react"
import { createElement } from "react"
import { afterEach, vi } from "vitest"

i18n.loadAndActivate({ locale: SOURCE_LOCALE_ID, messages: {} })

//* The theme provider and the toast host query media features on mount.
mockMatchMedia()

mockLayoutApis()

//* jsdom has no canvas to draw on: a real confetti burst crashes on its first animation frame.
vi.mock("canvas-confetti", () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) }))

//* The coin icon suspends while its icon loads, which holds every update rendering one inside a
//* synchronous `act`. Its ticker mark stands in; the UI Kit tests the icon itself.
vi.mock("@bitcart/ui-kit/components", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@bitcart/ui-kit/components")>()),
  CoinIcon: ({ symbol, network }: { symbol: string; network?: string | null }) =>
    createElement("span", { "aria-hidden": true, "data-network": network ?? undefined }, symbol),
  WalletLogo: () => createElement("span", { "aria-hidden": true }),
}))

//! The theme provider's inline script, rendered by next-themes, makes React warn on every client
//! render, which is how tests render it.
// TODO: Remove once next-themes stops rendering it on the client (https://github.com/pacocoursey/next-themes/issues/385).
const NEXT_THEMES_SCRIPT_WARNING = "Encountered a script tag while rendering React component."
const consoleError = console.error.bind(console)

console.error = (...args: Parameters<typeof console.error>) => {
  if (!(typeof args[0] === "string" && args[0].startsWith(NEXT_THEMES_SCRIPT_WARNING))) {
    consoleError(...args)
  }
}

afterEach(() => {
  cleanup()

  //* A newly mounted toast host replays every active toast, including toasts from earlier tests.
  toast.dismiss()
})
