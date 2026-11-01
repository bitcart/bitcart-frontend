import { readFileSync } from "node:fs"

import { oklchTripletToHex } from "@bitcart/core/colors"

import { extractHexAnnotatedOklchTriplets } from "@/common"

import type { GenericUnitTestTemplate } from "../types"

/**
 * Every OKLCH triplet in the file annotated with a hex comment must render as that hex on an
 * sRGB screen, and the file must carry at least one annotation. Each mismatch is reported.
 */
export const createOklchColorHexAnnotationTest: GenericUnitTestTemplate<{ filePath: string }> =
  ({ filePath }) =>
  ({ expect }) => {
    const colorEntries = extractHexAnnotatedOklchTriplets(readFileSync(filePath, "utf8"))

    expect(colorEntries.length).toBeGreaterThan(0)

    for (const [triplet, hexAnnotation] of colorEntries) {
      expect
        .soft(oklchTripletToHex(triplet).toUpperCase(), triplet)
        .toBe(hexAnnotation.toUpperCase())
    }
  }
