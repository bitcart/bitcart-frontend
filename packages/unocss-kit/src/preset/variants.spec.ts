import { createGenerator } from "unocss"
import { describe, expect, test } from "vitest"

import { presetBitcart } from "./definition"

describe("UnoCSS preset: variants", () => {
  test.each([
    [
      "has-[+[data-slot=trigger],+[data-slot=clear]]:pe-7",
      ":has(+[data-slot=trigger],+[data-slot=clear])",
    ],
    [
      "has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none",
      ":has(:disabled,:focus-visible,[aria-invalid])",
    ],
  ])("%s keeps its comma-separated selector list", async (utility, selector) => {
    const uno = await createGenerator({ presets: [presetBitcart()] })
    const { css } = await uno.generate(new Set([utility]), { preflights: false, safelist: false })

    expect(css).toContain(selector)
  })
})
