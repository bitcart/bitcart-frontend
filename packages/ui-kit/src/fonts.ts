import type { PresetBitcartPreflight } from "@bitcart/unocss-preset"
import type { WebFontsOptions } from "unocss/preset-web-fonts"

export const FONTS_PREFLIGHT: PresetBitcartPreflight = {
  //! Keep the URL bare (do not swap for a `?url` interpolation). Letting
  //! Vite's CSS URL rewriter process it in-place is what registers the
  //! asset in the chunk graph, which is in turn what triggers Vike's
  //! auto-preload.
  //!
  //! The full (non-subsetted) InterVariable.woff2 is required because
  //! the project ships non-Latin locales. Do NOT switch to Latin-only subsets.
  getCSS: () => /* CSS */ `
    @font-face {
      font-family: "InterVariable";
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      src: url("inter-ui/variable/InterVariable.woff2") format("woff2");
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

export const FONTS_PRESET_CONFIG: WebFontsOptions = {
  provider: "none",

  fonts: {
    sans: [{ name: "InterVariable" }, { name: "Inter Fallback" }, { name: "sans-serif" }],
  },
}
