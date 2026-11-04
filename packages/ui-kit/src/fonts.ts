import type { PresetBitcartPreflight } from "@bitcart/unocss-kit/preset"
import type { WebFontsOptions } from "unocss/preset-web-fonts"

//* Inter from @fontsource-variable/inter, split by script like `GEIST_MONO_PREFLIGHT`: a page
//* downloads the 73 KB Latin file, and the other scripts' files only for text that needs them.
//* The `opsz` files carry the optical size axis too, which gives large text Inter's Display cut.
//*
//! Each app must preload the Latin file alone: the Vike apps get that from `@bitcart/vike-kit`'s
//! `onRenderHtml`, and the others from a preload link of their own.
export const INTER_SUBSETS_PREFLIGHT: PresetBitcartPreflight = {
  getCSS: () => /* CSS */ `

    @font-face {
      font-family: "InterVariable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/inter/files/inter-cyrillic-ext-opsz-normal.woff2") format("woff2");
      unicode-range: U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;
    }

    @font-face {
      font-family: "InterVariable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/inter/files/inter-cyrillic-opsz-normal.woff2") format("woff2");
      unicode-range: U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;
    }

    @font-face {
      font-family: "InterVariable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/inter/files/inter-greek-ext-opsz-normal.woff2") format("woff2");
      unicode-range: U+1F00-1FFF;
    }

    @font-face {
      font-family: "InterVariable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/inter/files/inter-greek-opsz-normal.woff2") format("woff2");
      unicode-range: U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF;
    }

    @font-face {
      font-family: "InterVariable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/inter/files/inter-vietnamese-opsz-normal.woff2") format("woff2");
      unicode-range: U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;
    }

    @font-face {
      font-family: "InterVariable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/inter/files/inter-latin-ext-opsz-normal.woff2") format("woff2");
      unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;
    }

    @font-face {
      font-family: "InterVariable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2") format("woff2");
      unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    @font-face {
      font-family: "Inter Fallback";
      font-weight: 100 900;
      font-style: normal;
      src: local("Arial");
      ascent-override: 90%;
      descent-override: 22.43%;
      line-gap-override: 0%;
      size-adjust: 107.4%;
    }

  `,
}

//* Geist Mono, mirroring @fontsource-variable/geist-mono/index.css and its subsets: a browser
//* downloads only the subsets whose `unicode-range` the page's monospace text needs.
//*
//* Kept apart from `INTER_SUBSETS_PREFLIGHT`, for apps that show monospace text only. Apps without
//* it fall back to the system monospace in `font-mono`'s stack.
export const GEIST_MONO_PREFLIGHT: PresetBitcartPreflight = {
  getCSS: () => /* CSS */ `

    @font-face {
      font-family: "Geist Mono Variable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/geist-mono/files/geist-mono-cyrillic-ext-wght-normal.woff2") format("woff2");
      unicode-range: U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F;
    }

    @font-face {
      font-family: "Geist Mono Variable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/geist-mono/files/geist-mono-cyrillic-wght-normal.woff2") format("woff2");
      unicode-range: U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116;
    }

    @font-face {
      font-family: "Geist Mono Variable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/geist-mono/files/geist-mono-symbols2-wght-normal.woff2") format("woff2");
      unicode-range: U+2000-2001,U+2004-2008,U+200A,U+23B8-23BD,U+2500-259F;
    }

    @font-face {
      font-family: "Geist Mono Variable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/geist-mono/files/geist-mono-vietnamese-wght-normal.woff2") format("woff2");
      unicode-range: U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB;
    }

    @font-face {
      font-family: "Geist Mono Variable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/geist-mono/files/geist-mono-latin-ext-wght-normal.woff2") format("woff2");
      unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;
    }

    @font-face {
      font-family: "Geist Mono Variable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2") format("woff2");
      unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

  `,
}

export const FONTS_PRESET_CONFIG: WebFontsOptions = {
  provider: "none",

  fonts: {
    sans: [{ name: "InterVariable" }, { name: "Inter Fallback" }, { name: "sans-serif" }],
    mono: [{ name: "Geist Mono Variable" }],
  },
}
