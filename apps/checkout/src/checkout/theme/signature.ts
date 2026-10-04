import type { CheckoutThemeToken, OklchTriplet } from "./palette"

/**
 * The checkout's own palette, built from the Bitcart media kit: the `#FDF7FA` paper and `#2F0E4F`
 * ink in light mode, the `#1F0938` night in dark mode, and the `#8F0CF4` → `#9E60F4` brand violet.
 * Each mode's neutrals share the brand hue and step evenly from page to card to muted to border.
 */
export const CHECKOUT_SIGNATURE_TOKENS = {
  light: {
    background: "0.982 0.007 345.343", //                  #FDF7FA, brand paper
    foreground: "0.259 0.111 302.142", //                  #2F0E4F, brand ink
    card: "0.996 0.003 330",
    "card-foreground": "0.259 0.111 302.142",
    popover: "0.996 0.003 330",
    "popover-foreground": "0.259 0.111 302.142",
    primary: "0.5402 0.2826 300.675", //                  #8F0CF4, brand violet
    "primary-foreground": "1 0 0",
    secondary: "0.955 0.012 320",
    "secondary-foreground": "0.259 0.111 302.142",
    muted: "0.955 0.012 320",
    "muted-foreground": "0.49 0.045 305",
    accent: "0.95 0.035 305",
    "accent-foreground": "0.43 0.2 301",
    destructive: "0.577 0.245 27.325", //                  Red 600
    "destructive-foreground": "0.505 0.213 27.518", //     Red 700
    border: "0.915 0.018 315",
    input: "0.87 0.024 310",
    ring: "0.629 0.213 299.515", //                        #9E60F4, brand lilac
    success: "0.527 0.154 150.069", //                     Green 700
    "success-foreground": "1 0 0",
    warning: "0.555 0.163 48.998", //                      Amber 700
    pending: "0.546 0.245 262.881", //                     Blue 600
  },

  dark: {
    background: "0.208 0.086 300.354", //                  #1F0938, brand night
    foreground: "0.982 0.007 345.343", //                  #FDF7FA, brand paper
    card: "0.245 0.08 301",
    "card-foreground": "0.982 0.007 345.343",
    popover: "0.245 0.08 301",
    "popover-foreground": "0.982 0.007 345.343",

    //* White text on the brand lilac fails AA: buttons use a lighter lilac with night text.
    primary: "0.72 0.17 300",
    "primary-foreground": "0.208 0.086 300.354",
    secondary: "0.29 0.075 302",
    "secondary-foreground": "0.982 0.007 345.343",
    muted: "0.29 0.075 302",
    "muted-foreground": "0.78 0.045 305",
    accent: "0.32 0.11 301",
    "accent-foreground": "0.86 0.08 305",
    destructive: "0.637 0.237 25.331", //                  Red 500
    "destructive-foreground": "0.704 0.191 22.216", //     Red 400
    border: "0.33 0.07 302",
    input: "0.37 0.07 302",
    ring: "0.629 0.213 299.515", //                        #9E60F4, brand lilac
    success: "0.792 0.209 151.711", //                     Green 400
    "success-foreground": "0.266 0.065 152.934", //        Green 950
    warning: "0.828 0.189 84.429", //                      Amber 400
    pending: "0.707 0.165 254.624", //                     Blue 400
  },
} as const satisfies Record<"light" | "dark", Record<CheckoutThemeToken, OklchTriplet>>
