import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { getDefaultSelectors } from "eslint-plugin-better-tailwindcss/api/defaults"
import { MatcherType, SelectorKind } from "eslint-plugin-better-tailwindcss/api/types"
import { defineConfig } from "oxlint"
import { theme } from "unocss/preset-wind4"

const __dirname = dirname(fileURLToPath(import.meta.url))

//! The preset's own theme holds raw colors only: the theme tokens come from `presetBitcart`.
const RAW_COLORS = Object.entries(theme.colors)

const joinNames = (colors: typeof RAW_COLORS) => colors.map(([name]) => name).join("|")

const SCALED_COLOR_NAMES = joinNames(RAW_COLORS.filter(([, value]) => typeof value === "object"))
const FIXED_COLOR_NAMES = joinNames(RAW_COLORS.filter(([, value]) => typeof value === "string"))

const RAW_COLOR = String.raw`(?:(?:${SCALED_COLOR_NAMES})-\d{2,3}|${FIXED_COLOR_NAMES})\b`

const ARBITRARY_RAW_COLOR = String.raw`#[\da-fA-F]{3,8}|(?:rgba?|hsla?|oklch|oklab|color)\(|(?:[_\[(,]|color-|--color-)${RAW_COLOR}`

//* A shadow tinted only with translucent black or white, such as `shadow-black/10` or
//* `inset-shadow-[0_1px_color-black/4%]`: a depth cue that reads the same in every theme.
const NEUTRAL_SHADOW_CLASS = String.raw`(?:inset-|drop-)?shadow-(?:(?:${FIXED_COLOR_NAMES})\/\S+|\[[^\]#(]*(?:[_\[,]|color-)(?:${FIXED_COLOR_NAMES})\/[^\]#(]*\])$`

//* A color utility, with or without variants, naming a raw palette shade or a fixed color, or an
//* arbitrary value holding a raw color, such as `bg-emerald-500`, `dark:text-white` or
//* `border-[#ff0000]`.
const RAW_COLOR_CLASS_PATTERN = String.raw`^(?:\S*:)?!?(?!${NEUTRAL_SHADOW_CLASS})-?[a-z]+(?:-[a-z]+)*-(?:${RAW_COLOR}|\[.*(?:${ARBITRARY_RAW_COLOR})).*$`

const RAW_COLOR_RESTRICTION = {
  pattern: RAW_COLOR_CLASS_PATTERN,
  message:
    '"$0" bypasses the theme: style colors with theme tokens (`bg-primary`, ' +
    "`text-muted-foreground`, …) so themes and dark mode apply.",
}

//* Class strings kept in constants and lookup maps, such as `BACKDROP_CLASS_NAMES` or
//* `catalogEntryVariants`, which the default selectors leave unchecked.
const CLASS_CONSTANT_SELECTOR = {
  kind: SelectorKind.Variable,
  name: "^.*(?:ClassNames?|CLASS_NAMES?|Classes|CLASSES|Variants|VARIANTS)$",
  match: [{ type: MatcherType.String }, { type: MatcherType.ObjectValue }],
}

const PRIMARY_TEXT_RESTRICTION = {
  pattern: String.raw`^(?:\S*:)?!?text-primary(?:\/\d+)?$`,
  message:
    '"$0" colors text with the `primary` fill, which is too dark to read on dark surfaces: use ' +
    "`text-primary-text`. Keep `text-primary` for text on a `primary-foreground` fill only.",
}

export const unocssOxlintConfig = defineConfig({
  jsPlugins: ["eslint-plugin-better-tailwindcss", resolve(__dirname, "./classname-hygiene.ts")],

  rules: {
    "classname-hygiene/no-template-literal-classname": "error",

    // This rule is not properly compatible with unocss so disabling for now
    "better-tailwindcss/enforce-canonical-classes": "off",
    "better-tailwindcss/enforce-consistent-class-order": "error",

    // TODO: file an upstream issue to fix, then re-enable
    //! In "loose" strictness it indents wrapped classes from the attribute's current line, not
    //! from where the formatter moves the attribute, so `just fix` needs a second run to settle.
    "better-tailwindcss/enforce-consistent-line-wrapping": "off",

    "better-tailwindcss/no-conflicting-classes": "error",
    "better-tailwindcss/no-deprecated-classes": "error",
    "better-tailwindcss/no-duplicate-classes": "error",

    "better-tailwindcss/no-restricted-classes": [
      "error",
      {
        restrict: [RAW_COLOR_RESTRICTION, PRIMARY_TEXT_RESTRICTION],
        selectors: [...getDefaultSelectors(), CLASS_CONSTANT_SELECTOR],
      },
    ],

    "better-tailwindcss/no-unknown-classes": "off",
    "better-tailwindcss/no-unnecessary-whitespace": "error",
  },
})
