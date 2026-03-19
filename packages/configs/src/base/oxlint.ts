import { defineConfig } from "oxlint"

export const baseOxlintConfig = defineConfig({
  plugins: ["eslint", "typescript", "oxc", "import", "promise"],

  options: {
    typeAware: true,
    denyWarnings: true,
  },

  jsPlugins: [{ name: "stylistic-js", specifier: "@stylistic/eslint-plugin" }],

  env: {
    "shared-node-browser": true,
  },

  rules: {
    "stylistic-js/lines-around-comment": [
      "error",

      {
        allowArrayStart: true,
        allowBlockStart: true,
        allowClassStart: true,
        allowEnumStart: true,
        allowInterfaceStart: true,
        allowModuleStart: true,
        allowObjectStart: true,
        allowTypeStart: true,
        beforeBlockComment: true,
        beforeLineComment: true,
      },
    ],

    "stylistic-js/rest-spread-spacing": ["error"],

    "stylistic-js/padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "multiline-const" },
      { blankLine: "always", prev: "multiline-const", next: "*" },
      { blankLine: "always", prev: "*", next: "multiline-let" },
      { blankLine: "always", prev: "multiline-let", next: "*" },
      { blankLine: "always", prev: "*", next: "multiline-export" },
      { blankLine: "always", prev: "multiline-export", next: "*" },
      { blankLine: "always", prev: "*", next: "multiline-block-like" },
      { blankLine: "always", prev: "multiline-block-like", next: "*" },
      { blankLine: "always", prev: "*", next: "multiline-expression" },
      { blankLine: "always", prev: "multiline-expression", next: "*" },
      { blankLine: "always", prev: "*", next: "return" },
    ],

    "getter-return": "error",
    "import/default": "error",
    "import/export": "error",
    "import/named": "error",
    "import/namespace": "error",
    "import/no-duplicates": ["error", { preferInline: true }],
    "import/no-named-as-default": "error",
    "import/no-named-as-default-member": "error",
    "no-array-constructor": "error",
    "no-case-declarations": "error",
    "no-empty": "error",
    "no-empty-function": "error",
    "no-empty-object-type": "off",
    "no-fallthrough": "error",
    "no-nested-ternary": "error",
    "no-prototype-builtins": "error",
    "no-regex-spaces": "error",

    "no-restricted-imports": [
      "warn",

      {
        patterns: [
          {
            group: ["../../**"],
            message: "Avoid relative parent imports deeper than one level.",
          },
        ],
      },
    ],

    "no-shadow": "error",
    "no-var": "error",
    "prefer-promise-reject-errors": "error",
    "typescript/no-floating-promises": "error",
    "typescript/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
    "typescript/only-throw-error": "error",
    "typescript/prefer-promise-reject-errors": "error",
    "typescript/require-await": "error",
  },
})
