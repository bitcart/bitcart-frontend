import type { DummyRuleMap } from "oxlint"
import { theme } from "unocss/preset-wind4"

//! The preset's own theme holds raw colors only: the theme tokens come from `presetBitcart`.
const RAW_COLORS = Object.entries(theme.colors)

const joinNames = (colors: typeof RAW_COLORS) => colors.map(([name]) => name).join("|")

const SCALED_COLOR_NAMES = joinNames(RAW_COLORS.filter(([, value]) => typeof value === "object"))
const FIXED_COLOR_NAMES = joinNames(RAW_COLORS.filter(([, value]) => typeof value === "string"))

//* A color utility, with or without variants, naming a raw palette shade, a fixed color or an
//* arbitrary color value, such as `bg-emerald-500`, `dark:text-white` or `border-[#ff0000]`.
const RAW_COLOR_CLASS_PATTERN = String.raw`^(?:\S*:)?!?-?[a-z]+(?:-[a-z]+)*-(?:(?:${SCALED_COLOR_NAMES})-\d{2,3}|${FIXED_COLOR_NAMES}|\[(?:#|rgba?\(|hsla?\(|oklch\(|oklab\(|color\()).*$`

//! Relies on `unocssOxlintConfig` loading `eslint-plugin-better-tailwindcss`.
export const themeTokensOxlintRules = {
  "better-tailwindcss/no-restricted-classes": [
    "error",
    {
      restrict: [
        {
          pattern: RAW_COLOR_CLASS_PATTERN,
          message:
            '"$0" bypasses the theme: style colors with theme tokens (`bg-primary`, ' +
            "`text-muted-foreground`, …) so themes and dark mode apply.",
        },
      ],
    },
  ],
} satisfies DummyRuleMap
