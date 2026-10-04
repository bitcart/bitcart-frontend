import type { CheckoutPaletteTokensInput } from "./palette"

export const CHECKOUT_PALETTE_PRESETS = {
  ocean: {
    light: {
      primary: "oklch(0.5 0.134 242.749)",
      "primary-foreground": "oklch(1 0 0)",
      ring: "oklch(0.588 0.158 241.966)",
      accent: "oklch(0.951 0.026 236.824)",
      "accent-foreground": "oklch(0.443 0.11 240.79)",
    },

    dark: {
      primary: "oklch(0.685 0.169 237.323)",
      "primary-foreground": "oklch(0.293 0.066 243.157)",
      ring: "oklch(0.746 0.16 232.661)",
      accent: "oklch(0.293 0.066 243.157)",
      "accent-foreground": "oklch(0.828 0.111 230.318)",
    },
  },

  forest: {
    light: {
      primary: "oklch(0.508 0.118 165.612)",
      "primary-foreground": "oklch(1 0 0)",
      ring: "oklch(0.596 0.145 163.225)",
      accent: "oklch(0.95 0.052 163.051)",
      "accent-foreground": "oklch(0.432 0.095 166.913)",
    },

    dark: {
      primary: "oklch(0.696 0.17 162.48)",
      "primary-foreground": "oklch(0.262 0.051 172.552)",
      ring: "oklch(0.765 0.177 163.223)",
      accent: "oklch(0.262 0.051 172.552)",
      "accent-foreground": "oklch(0.845 0.143 164.978)",
    },
  },

  sunset: {
    light: {
      primary: "oklch(0.553 0.195 38.402)",
      "primary-foreground": "oklch(1 0 0)",
      ring: "oklch(0.646 0.222 41.116)",
      accent: "oklch(0.954 0.038 75.164)",
      "accent-foreground": "oklch(0.47 0.157 37.304)",
    },

    dark: {
      primary: "oklch(0.705 0.213 47.604)",
      "primary-foreground": "oklch(0.266 0.079 36.259)",
      ring: "oklch(0.75 0.183 55.934)",
      accent: "oklch(0.266 0.079 36.259)",
      "accent-foreground": "oklch(0.837 0.128 66.29)",
    },
  },

  graphite: {
    light: {
      primary: "oklch(0.205 0 0)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.556 0 0)",
      accent: "oklch(0.97 0 0)",
      "accent-foreground": "oklch(0.205 0 0)",
    },

    dark: {
      primary: "oklch(0.97 0 0)",
      "primary-foreground": "oklch(0.205 0 0)",
      ring: "oklch(0.556 0 0)",
      accent: "oklch(0.269 0 0)",
      "accent-foreground": "oklch(0.97 0 0)",
    },
  },

  //* Light mode: warm paper surfaces with a deep teal brand. Dark mode: ink surfaces with bright
  //* teal. Each mode's neutrals share one hue and step up evenly from background to card to border.
  harbor: {
    light: {
      background: "oklch(0.977 0.007 80.721)",
      foreground: "oklch(0.225 0.011 73.349)",
      card: "oklch(0.994 0.006 84.566)",
      "card-foreground": "oklch(0.225 0.011 73.349)",
      popover: "oklch(0.994 0.006 84.566)",
      "popover-foreground": "oklch(0.225 0.011 73.349)",
      primary: "oklch(0.511 0.086 186.391)",
      "primary-foreground": "oklch(1 0 0)",
      secondary: "oklch(0.948 0.014 78.262)",
      "secondary-foreground": "oklch(0.33 0.017 70.907)",
      muted: "oklch(0.933 0.017 79.35)",
      "muted-foreground": "oklch(0.501 0.021 72.855)",
      accent: "oklch(0.953 0.05 180.801)",
      "accent-foreground": "oklch(0.437 0.071 188.216)",
      border: "oklch(0.898 0.023 78.209)",
      input: "oklch(0.853 0.028 78.167)",
      ring: "oklch(0.6 0.118 184.704)",
    },

    dark: {
      background: "oklch(0.187 0.01 234.391)",
      foreground: "oklch(0.945 0.007 219.562)",
      card: "oklch(0.221 0.013 233.195)",
      "card-foreground": "oklch(0.945 0.007 219.562)",
      popover: "oklch(0.221 0.013 233.195)",
      "popover-foreground": "oklch(0.945 0.007 219.562)",
      primary: "oklch(0.785 0.133 181.912)",
      "primary-foreground": "oklch(0.277 0.045 192.524)",
      secondary: "oklch(0.257 0.017 229.845)",
      "secondary-foreground": "oklch(0.894 0.012 217.551)",
      muted: "oklch(0.277 0.018 227.402)",
      "muted-foreground": "oklch(0.718 0.024 217.721)",
      accent: "oklch(0.386 0.059 188.416)",
      "accent-foreground": "oklch(0.91 0.093 180.426)",
      border: "oklch(0.307 0.022 226.093)",
      input: "oklch(0.345 0.024 226.585)",
      ring: "oklch(0.855 0.125 181.071)",
    },
  },
} as const satisfies Record<string, CheckoutPaletteTokensInput>

export type CheckoutPalettePresetId = keyof typeof CHECKOUT_PALETTE_PRESETS
