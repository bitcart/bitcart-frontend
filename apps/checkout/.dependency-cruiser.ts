import { appDependencyCruiserConfig } from "@bitcart/configs/by-package-type/app-dependency-cruiser"
import type { IConfiguration } from "dependency-cruiser"

const APP_INTERNALS = "^src/(?:routes|common|env\\.ts|router\\.tsx|app\\.config\\.ts)"

const ROUTER = "@tanstack/react-router"

export default {
  ...appDependencyCruiserConfig,

  forbidden: [
    {
      name: "checkout-template-isolation",
      comment: "A checkout template never imports another template.",
      severity: "error",
      from: { path: "^src/templates/([^/]+)/" },
      to: { path: "^src/templates/", pathNot: "^src/templates/$1/" },
    },

    {
      name: "checkout-template-public-api",
      comment:
        "Checkout templates import the checkout core through `#/checkout` only, and their tests through `#/checkout/testing`.",
      severity: "error",
      from: { path: "^src/templates/" },
      to: { path: "^src/checkout/", pathNot: "^src/checkout/(?:testing/)?index\\.ts$" },
    },

    {
      name: "checkout-template-no-raw-api",
      comment: "Checkout templates read the checkout model, never the raw API or the router.",
      severity: "error",
      from: { path: "^src/templates/" },
      to: { path: [APP_INTERNALS, "@bitcart/api-sdk", ROUTER] },
    },

    {
      name: "checkout-default-screens-public-api",
      comment:
        "Default screens import the checkout core through `#/checkout` and `#/checkout/testing` only, like templates: overriding them must never require more than the public API.",
      severity: "error",
      from: { path: "^src/checkout/screens/" },
      to: {
        path: "^src/checkout/",
        pathNot: "^src/checkout/(?:(?:testing/)?index\\.ts$|screens/)",
      },
    },

    {
      name: "checkout-core-portability",
      comment:
        "The checkout core stays extractable into a package: app-specific values are passed in through `CheckoutProvider`.",
      severity: "error",
      from: { path: "^src/checkout/" },
      to: { path: [APP_INTERNALS, "^src/templates/", ROUTER] },
    },
  ],
} satisfies IConfiguration
