import { PRESET_NAME } from "./constants"
import type { ThemeColorScheme, ThemeColorSchemeParams } from "./types"

export const getColorScheme = ({
  name,
  light,
  dark,
}: ThemeColorSchemeParams = {}): ThemeColorScheme => ({
  name: name ?? PRESET_NAME,

  light: {
    background: "1 0 0", //                               oklch(1 0 0), White
    foreground: ".13 0.028 261.692", //                   oklch(.13 0.028 261.692), Gray 950

    muted: ".872 0.01 258.338", //                        oklch(.872 0.01 258.338), Gray 300
    "muted-foreground": ".446 0.03 256.802", //           oklch(.446 0.03 256.802), Gray 600

    primary: ".558 .288 302.321", //                      oklch(.558 .288 302.321), Purple 600
    "primary-foreground": "1 0 0", //                     oklch(1 0 0), White

    secondary: ".985 .002 247.839", //                    oklch(.985 .002 247.839), Gray 50
    "secondary-foreground": ".278 0.033 256.848", //      oklch(.278 0.033 256.848), Gray 800

    accent: ".946 0.033 307.174", //                      oklch(.946 0.033 307.174), Purple 100
    "accent-foreground": ".496 0.265 301.924", //         oklch(.496 0.265 301.924), Purple 700

    destructive: ".704 0.191 22.216", //                  oklch(.704 0.191 22.216), Red 400
    "destructive-foreground": ".505 .213 27.518", //      oklch(.505 .213 27.518), Red 700

    border: ".967 0.003 264.542", //                      oklch(.967 0.003 264.542), Gray 100
    input: ".872 0.01 258.338", //                        oklch(.872 0.01 258.338), Gray 300
    ring: ".627 0.265 303.9", //                          oklch(.627 0.265 303.9), Purple 500

    card: "1 0 0", //                                     oklch(1 0 0), White
    "card-foreground": ".13 0.028 261.692", //            oklch(.13 0.028 261.692), Gray 950

    popover: "1 0 0", //                                  oklch(1 0 0), White
    "popover-foreground": ".13 0.028 261.692", //         oklch(.13 0.028 261.692), Gray 950

    ...light,
  },

  dark: {
    background: ".21 0.034 264.665", //                   oklch(.21 0.034 264.665), Gray 900
    foreground: "1 0 0", //                               oklch(1 0 0), White

    muted: ".446 0.03 256.802", //                        oklch(.446 0.03 256.802), Gray 600
    "muted-foreground": ".872 0.01 258.338", //           oklch(.872 0.01 258.338), Gray 300

    primary: ".496 0.265 301.924", //                     oklch(.496 0.265 301.924), Purple 700
    "primary-foreground": "1 0 0", //                     oklch(1 0 0), White

    secondary: ".278 0.033 256.848", //                   oklch(.278 0.033 256.848), Gray 800
    "secondary-foreground": ".928 0.006 264.531", //      oklch(.928 0.006 264.531), Gray 200

    accent: ".291 .149 302.717", //                       oklch(.291 .149 302.717), Purple 950
    "accent-foreground": ".714 0.203 305.504", //         oklch(.714 0.203 305.504), Purple 400

    destructive: ".637 0.237 25.331", //                  oklch(.637 0.237 25.331), Red 500
    "destructive-foreground": ".704 0.191 22.216", //     oklch(.704 0.191 22.216), Red 400

    border: ".373 0.034 259.733", //                      oklch(.373 0.034 259.733), Gray 700
    input: ".446 0.03 256.802", //                        oklch(.446 0.03 256.802), Gray 600
    ring: ".627 0.265 303.9", //                          oklch(.627 0.265 303.9), Purple 500

    card: ".21 .034 264.665", //                          oklch(.21 .034 264.665), Gray 900
    "card-foreground": "1 0 0", //                        oklch(1 0 0), White

    popover: ".21 0.034 264.665", //                      oklch(.21 0.034 264.665), Gray 900
    "popover-foreground": "1 0 0", //                     oklch(1 0 0), White

    ...dark,
  },
})
