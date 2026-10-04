import { FONTS_PREFLIGHT, FONTS_PRESET_CONFIG } from "@bitcart/ui-kit/fonts"
import { presetBitcart } from "@bitcart/unocss-preset"
import { defineConfig, presetWebFonts } from "unocss"

import { CHECKOUT_STATUS_TOKENS } from "./src/checkout/theme/palette"
import { CHECKOUT_SIGNATURE_TOKENS } from "./src/checkout/theme/signature"

const pickStatusTokens = (tokens: (typeof CHECKOUT_SIGNATURE_TOKENS)["light" | "dark"]) =>
  Object.fromEntries(CHECKOUT_STATUS_TOKENS.map((token) => [token, tokens[token]]))

const toCssVariables = (tokens: Record<string, string>) =>
  Object.entries(tokens)
    .map(([token, value]) => `--${token}: ${value};`)
    .join(" ")

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.tsx", "../../packages/ui-kit/src/**/*.tsx"],
      outFile: "src/routes/-layout/uno.generated.css",
    },
  },

  presets: [
    presetBitcart({
      colorSchemes: {
        name: "bitcart-checkout",
        light: CHECKOUT_SIGNATURE_TOKENS.light,
        dark: CHECKOUT_SIGNATURE_TOKENS.dark,
      },

      preflights: [
        FONTS_PREFLIGHT,

        {
          getCSS: () =>
            `:root { ${toCssVariables(pickStatusTokens(CHECKOUT_SIGNATURE_TOKENS.light))} }\n` +
            `.dark { ${toCssVariables(pickStatusTokens(CHECKOUT_SIGNATURE_TOKENS.dark))} }`,
        },
      ],
    }),

    presetWebFonts(FONTS_PRESET_CONFIG),
  ],

  theme: {
    colors: {
      success: {
        DEFAULT: "oklch(var(--success))",
        foreground: "oklch(var(--success-foreground))",
      },

      warning: "oklch(var(--warning))",
      pending: "oklch(var(--pending))",
    },

    //* TODO: Consider replacing with identical animations from Uno animation presets
    //* and backporting anything that makes sense to backport back to our Uno preset.
    animation: {
      keyframes: {
        "check-stroke": `{
          to { stroke-dashoffset: 0 }
        }`,

        "scale-fade-in": `{
          0% { opacity: 0; transform: scale(0.8) }
          100% { opacity: 1; transform: scale(1) }
        }`,

        shake: `{
          0%, 100% { transform: translateX(0) }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px) }
          20%, 40%, 60%, 80% { transform: translateX(4px) }
        }`,

        "copied-flash": `{
          0% { opacity: 0; transform: scale(0.95) }
          15% { opacity: 1; transform: scale(1) }
          70% { opacity: 1; transform: scale(1) }
          100% { opacity: 0; transform: scale(0.95) }
        }`,
      },

      durations: {
        "check-stroke": "0.4s",
        "scale-fade-in": "0.4s",
        shake: "0.6s",
        "copied-flash": "0.8s",
      },

      timingFns: {
        "check-stroke": "ease-in-out",
        "scale-fade-in": "ease-out",
        shake: "ease-in-out",
        "copied-flash": "ease-in-out",
      },
    },
  },
})
