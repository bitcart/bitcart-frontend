import { GLOBAL_THEME_OVERRIDE_TESTID } from "@bitcart/qa"
import type { ThemeTweak } from "@bitcart/unocss-kit/schemas"
import { themeTweakSequenceToGlobalColorVariableOverrides } from "@bitcart/unocss-kit/utils"
import type React from "react"
import { useId } from "react"
import { isEmpty } from "remeda"

export type GlobalThemeOverrideProps = {
  themeTweaks: ThemeTweak[]
}

/**
 * Merges the given theme tweaks and converts the resulting theme override to a stylesheet
 * containing CSS variable declarations that take global precedence over their counterparts
 * keyed specifically to the document root, making every element in the it inherit the theme.
 * The tweak merge precedence directly follows the order in which the tweaks are specified.
 *
 * Note that the theme is applied only while this component is mounted.
 */
export const GlobalThemeOverride: React.FC<GlobalThemeOverrideProps> = ({ themeTweaks }) => {
  const stylesheetElementId = useId()

  const paletteStylesheets: string[] = themeTweakSequenceToGlobalColorVariableOverrides({
    stylesheetElementId,
    themeTweaks,
  })

  if (isEmpty(paletteStylesheets)) {
    return null
  } else {
    return (
      <style id={stylesheetElementId} data-testid={GLOBAL_THEME_OVERRIDE_TESTID}>
        {paletteStylesheets.join("\n")}
      </style>
    )
  }
}
