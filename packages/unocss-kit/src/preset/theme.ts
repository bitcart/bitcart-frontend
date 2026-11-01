import type { Theme, ThemeOverrides } from "#/types"
import { withPrimaryTextFallback } from "#/utils"

import { BASE_THEME_NAME } from "./constants"

export const getTheme = ({ name, light, dark }: ThemeOverrides = {}): Theme => ({
  name: name ?? BASE_THEME_NAME,

  light: {
    background: "0.993 0.003 325", //                     #FEFCFE
    foreground: "0.259 0.111 302.142", //                 #2F0E4F, Brand Ink

    muted: "0.955 0.012 320", //                          #F4EEF5
    "muted-foreground": "0.49 0.045 305", //              #665A75

    primary: "0.5402 0.2826 300.675", //                  #8F0CF4, Brand Violet
    "primary-foreground": "1 0 0", //                     #FFFFFF, White
    "primary-text": "0.5402 0.2826 300.675", //           #8F0CF4, Brand Violet

    secondary: "0.975 0.006 315", //                      #F8F6FA
    "secondary-foreground": "0.259 0.111 302.142", //     #2F0E4F, Brand Ink

    accent: "0.95 0.035 305", //                          #F4E9FF
    "accent-foreground": "0.43 0.2 301", //               #651FA9

    destructive: "0.577 0.245 27.325", //                 #E7000B, Red 600
    "destructive-foreground": "0.505 0.213 27.518", //    #C10007, Red 700

    border: "0.915 0.018 315", //                         #E8E0EB
    input: "0.87 0.024 310", //                           #D9D0E0
    ring: "0.629 0.213 299.515", //                       #9E60F4, Brand Lilac

    card: "1 0 0", //                                     #FFFFFF, White
    "card-foreground": "0.259 0.111 302.142", //          #2F0E4F, Brand Ink

    popover: "1 0 0", //                                  #FFFFFF, White
    "popover-foreground": "0.259 0.111 302.142", //       #2F0E4F, Brand Ink

    success: "0.527 0.154 150.069", //                    #008236, Green 700
    "success-foreground": "1 0 0", //                     #FFFFFF, White

    warning: "0.555 0.163 48.998", //                     #BB4D00, Amber 700
    pending: "0.546 0.245 262.881", //                    #155DFC, Blue 600

    ...withPrimaryTextFallback(light),
  },

  dark: {
    background: "0.208 0.086 300.354", //                 #1F0938, Brand Night
    foreground: "0.982 0.007 345.343", //                 #FDF7FA, Brand Paper

    muted: "0.29 0.075 302", //                           #33214A
    "muted-foreground": "0.78 0.045 305", //              #BEB1CF

    //* Brand Violet is too dark to read as text on Brand Night: brand text takes a lighter lilac.
    primary: "0.5402 0.2826 300.675", //                  #8F0CF4, Brand Violet
    "primary-foreground": "1 0 0", //                     #FFFFFF, White
    "primary-text": "0.72 0.17 300", //                   #B688FE

    secondary: "0.29 0.075 302", //                       #33214A
    "secondary-foreground": "0.982 0.007 345.343", //     #FDF7FA, Brand Paper

    accent: "0.32 0.11 301", //                           #3D2061
    "accent-foreground": "0.86 0.08 305", //              #DDC4FC

    destructive: "0.637 0.237 25.331", //                 #FB2C36, Red 500
    "destructive-foreground": "0.704 0.191 22.216", //    #FF6467, Red 400

    border: "0.33 0.07 302", //                           #3C2C53
    input: "0.37 0.07 302", //                            #47365E
    ring: "0.629 0.213 299.515", //                       #9E60F4, Brand Lilac

    card: "0.245 0.08 301", //                            #271440
    "card-foreground": "0.982 0.007 345.343", //          #FDF7FA, Brand Paper

    popover: "0.245 0.08 301", //                         #271440
    "popover-foreground": "0.982 0.007 345.343", //       #FDF7FA, Brand Paper

    success: "0.792 0.209 151.711", //                    #05DF72, Green 400
    "success-foreground": "0.266 0.065 152.934", //       #032E15, Green 950

    warning: "0.828 0.189 84.429", //                     #FFBA00, Amber 400
    pending: "0.707 0.165 254.624", //                    #51A2FF, Blue 400

    ...withPrimaryTextFallback(dark),
  },
})
