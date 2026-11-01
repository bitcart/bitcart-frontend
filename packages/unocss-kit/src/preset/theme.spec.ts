import { resolve } from "node:path"

import { createOklchColorHexAnnotationTest } from "@bitcart/qa/unit"
import { describe, test } from "vitest"

import { createThemeWcagComplianceTests } from "#/test-templates"

import { getTheme } from "./theme"

describe("UnoCSS preset: theme", () => {
  test(
    "palette color hex annotations match their oklch counterparts",
    createOklchColorHexAnnotationTest({ filePath: resolve(import.meta.dirname, "theme.ts") }),
  )

  describe("WCAG AA level compliance", createThemeWcagComplianceTests([getTheme()]))
})
