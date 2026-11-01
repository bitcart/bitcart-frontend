import { getTheme } from "@bitcart/unocss-kit/preset"
import { createThemeWcagComplianceTests } from "@bitcart/unocss-kit/test-templates"
import { describe } from "vitest"

import { CHECKOUT_THEME_PRESET_IDS } from "./presets"
import { checkoutThemeSchema } from "./schemas"

describe(
  "WCAG AA level compliance check for Checkout theme presets",

  createThemeWcagComplianceTests(
    CHECKOUT_THEME_PRESET_IDS.map((presetId) =>
      getTheme({ name: presetId, ...checkoutThemeSchema.parse({ preset: presetId }) }),
    ),
  ),
)
