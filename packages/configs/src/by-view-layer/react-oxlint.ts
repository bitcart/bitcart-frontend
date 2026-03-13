import { defineConfig } from "oxlint"

export const reactOxlintConfig = defineConfig({
  plugins: ["react", "jsx-a11y"],

  jsPlugins: [{ name: "react-hooks-js", specifier: "eslint-plugin-react-hooks" }],

  rules: {
    "react/exhaustive-deps": "error",
    "react/jsx-no-target-blank": "error",
    "react/only-export-components": "error",
    "react/rules-of-hooks": "error",
    "react-hooks-js/component-hook-factories": "error",
    "react-hooks-js/config": "error",
    "react-hooks-js/error-boundaries": "error",
    "react-hooks-js/gating": "error",
    "react-hooks-js/globals": "error",
    "react-hooks-js/immutability": "error",
    "react-hooks-js/incompatible-library": "warn",
    "react-hooks-js/preserve-manual-memoization": "error",
    "react-hooks-js/purity": "error",
    "react-hooks-js/refs": "error",
    "react-hooks-js/set-state-in-effect": "error",
    "react-hooks-js/set-state-in-render": "error",
    "react-hooks-js/static-components": "error",
    "react-hooks-js/unsupported-syntax": "warn",
    "react-hooks-js/use-memo": "error",
  },
})
