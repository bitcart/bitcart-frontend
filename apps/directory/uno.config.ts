import { presetBitcart } from "@bitcart/unocss-preset"
import { defineConfig, presetWebFonts } from "unocss"

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.tsx", "../../packages/ui-kit/src/**/*.tsx"],
      outFile: "src/pages/uno.generated.css",
    },
  },

  presets: [
    presetBitcart({
      colorScheme: {
        name: "bitcart-directory",

        light: {
          background: ".985 .002 247.839", //                 oklch(.985 .002 247.839), Gray 50
          foreground: ".13 0.028 261.692", //                 oklch(.13 0.028 261.692), Gray 950

          muted: ".872 0.01 258.338", //                      oklch(.872 0.01 258.338), Gray 300
          "muted-foreground": ".446 0.03 256.802", //         oklch(.446 0.03 256.802), Gray 600

          secondary: ".551 .027 264.364", //                  oklch(.551 .027 264.364), Gray 500
          "secondary-foreground": ".985 .002 247.839", //     oklch(.985 .002 247.839), Gray 50

          card: "1 0 0", //                                   oklch(1 0 0), White
          "card-foreground": ".13 0.028 261.692", //          oklch(.13 0.028 261.692), Gray 950
        },

        dark: {
          background: ".21 0.034 264.665", //                 oklch(.21 0.034 264.665), Gray 900
          foreground: "1 0 0", //                             oklch(1 0 0), White

          muted: ".446 0.03 256.802", //                      oklch(.446 0.03 256.802), Gray 600
          "muted-foreground": ".872 0.01 258.338", //         oklch(.872 0.01 258.338), Gray 300

          secondary: ".373 .034 259.733", //                  oklch(.373 .034 259.733), Gray 700
          "secondary-foreground": ".985 .002 247.839", //     oklch(.985 .002 247.839), Gray 50

          card: ".278 .033 256.848", //                       oklch(.278 .033 256.848), Gray 800
          "card-foreground": "1 0 0", //                      oklch(1 0 0), White
        },
      },
    }),

    presetWebFonts({
      provider: "none",

      fonts: {
        sans: {
          name: "Inter",
          weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        },
      },
    }),
  ],
})
