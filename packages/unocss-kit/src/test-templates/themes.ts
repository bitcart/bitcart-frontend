import { getOklchLightness, getSrgbContrast } from "@bitcart/core/colors"
import { describe, expect, test } from "vitest"

import { WCAG_TEXT_CONTRAST_COLOR_TOKEN_PAIRS } from "#/constants"
import type { PaletteColorToken, Theme } from "#/types"

/**
 * Web Content Accessibility Guidelines AA level compliance test suite template.
 */
export const createThemeWcagComplianceTests =
  (themes: readonly Theme[]): (() => void) =>
  () => {
    describe.each(
      themes.flatMap(({ name, ...modes }) =>
        (["light", "dark"] as const).map((mode) => [name, mode, modes[mode]] as const),
      ),
    )("The %s theme in %s mode", (_name, mode, tokens) => {
      test.each(WCAG_TEXT_CONTRAST_COLOR_TOKEN_PAIRS)(
        "keeps %s readable on %s",
        (text, surface) => {
          expect(getSrgbContrast(tokens[text], tokens[surface])).toBeGreaterThanOrEqual(4.5)
        },
      )

      test("keeps primary fills and borders distinguishable from the page", () => {
        expect(getSrgbContrast(tokens.primary, tokens.background)).toBeGreaterThanOrEqual(3)
      })

      test("keeps the focus ring visible on cards", () => {
        expect(getSrgbContrast(tokens.ring, tokens.card)).toBeGreaterThanOrEqual(3)
      })

      test("lifts cards off the page and steps borders beyond muted surfaces", () => {
        const lightness = (token: PaletteColorToken) => getOklchLightness(tokens[token])
        const awayFromCard = mode === "light" ? -1 : 1

        expect(lightness("card")).toBeGreaterThan(lightness("background"))
        expect(awayFromCard * (lightness("muted") - lightness("card"))).toBeGreaterThan(0)
        expect(awayFromCard * (lightness("border") - lightness("muted"))).toBeGreaterThan(0)
      })
    })
  }
