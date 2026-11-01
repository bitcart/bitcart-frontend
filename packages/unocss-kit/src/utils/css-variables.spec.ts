import { describe, expect, test } from "vitest"

import { themeTweakSequenceToGlobalColorVariableOverrides } from "./css-variables"

describe("themeTweakSequenceToGlobalColorVariableOverrides", () => {
  test("lets a later layer that recolors `primary` alone recolor `primary-text` too", () => {
    const [darkRule] = themeTweakSequenceToGlobalColorVariableOverrides({
      stylesheetElementId: "theme",

      themeTweaks: [
        { light: {}, dark: { primary: "0.54 0.28 300", "primary-text": "0.72 0.17 300" } },
        { light: {}, dark: { primary: "0.68 0.16 237" } },
      ],
    })

    expect(darkRule).toContain("--primary: 0.68 0.16 237 !important;")
    expect(darkRule).toContain("--primary-text: 0.68 0.16 237 !important;")
  })
})
