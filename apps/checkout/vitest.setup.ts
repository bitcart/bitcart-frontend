import "@testing-library/jest-dom/vitest"
import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { mockMatchMedia } from "@bitcart/qa/unit"
import { toast } from "@bitcart/ui-kit/utils"
import { i18n } from "@lingui/core"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

i18n.loadAndActivate({ locale: SOURCE_LOCALE_ID, messages: {} })

//* The theme provider and the toast host query media features on mount.
mockMatchMedia()

//* jsdom has no canvas to draw on: a real confetti burst crashes on its first animation frame.
vi.mock("canvas-confetti", () => ({ default: Object.assign(vi.fn(), { reset: vi.fn() }) }))

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
