import path from "node:path"

import js from "@eslint/js"
import stylisticPlugin from "@stylistic/eslint-plugin"
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin"
import eslintParserTypeScript from "@typescript-eslint/parser"
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss"
import importPlugin from "eslint-plugin-import"
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import eslintPluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import { defineConfig } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

const REACT_LIBS = ["packages/form-kit", "packages/ui-kit", "packages/vike-kit"]
const REACT_APPS = ["apps/landing", "apps/directory"]
const UNOCSS_CONSUMER_LIBS = ["packages/ui-kit"]
const UNOCSS_CONSUMER_APPS = ["apps/landing", "apps/directory"]

export default defineConfig(
  { ignores: ["**/dist"] },

  {
    extends: [js.configs.recommended],
    files: ["**/*.{js,ts,tsx}"],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    rules: { "no-nested-ternary": "warn" },
  },

  {
    files: ["{apps,packages}/**/*.{ts,tsx}"],

    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],

    plugins: {
      "@stylistic": stylisticPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
    },

    languageOptions: {
      parser: eslintParserTypeScript,

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      "import/resolver": { typescript: true },
    },

    rules: {
      "@stylistic/lines-around-comment": [
        "error",
        { allowBlockStart: true, beforeBlockComment: true, beforeLineComment: true },
      ],

      "@stylistic/object-curly-newline": ["error", { multiline: true }],
      "@stylistic/rest-spread-spacing": ["error"],

      "@stylistic/padding-line-between-statements": [
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

      "@typescript-eslint/no-empty-object-type": "off",

      "@typescript-eslint/no-misused-promises": [
        "error",

        {
          checksVoidReturn: { attributes: false },
          checksConditionals: true,
          checksSpreads: true,
        },
      ],

      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/consistent-type-definitions": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      //* Superseded by `@typescript-eslint`
      "import/no-unresolved": "off",

      "import/order": [
        "error",

        {
          groups: [
            "builtin",
            "external",
            "internal",
            "unknown", //* For virtual imports
            ["sibling", "parent"],
            "index",
          ],

          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      "no-restricted-imports": [
        "warn",

        {
          patterns: [
            {
              group: ["../../*"],
              message: "Avoid relative parent imports deeper than one level.",
            },
          ],
        },
      ],
    },
  },

  {
    files: [...REACT_LIBS, ...REACT_APPS].map((pkgRoot) => `${pkgRoot}/src/**/*.{ts,tsx}`),

    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    extends: [eslintPluginReact.configs.flat.recommended],

    settings: {
      react: { version: "detect" },
    },

    rules: {
      ...reactHooks.configs.flat.recommended.rules,

      //* Doesn't handle React.FC<TProps> and TS alone will suffice
      "react/prop-types": "off",

      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  {
    files: [...UNOCSS_CONSUMER_LIBS, ...UNOCSS_CONSUMER_APPS].map(
      (pkgRoot) => `${pkgRoot}/src/**/*.{ts,tsx}`,
    ),

    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },

    rules: {
      ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,

      "better-tailwindcss/enforce-consistent-line-wrapping": [
        "warn",
        { preferSingleLine: true, printWidth: 100 },
      ],

      "better-tailwindcss/no-unknown-classes": "off",
    },
  },

  UNOCSS_CONSUMER_LIBS.map((libRoot) => ({
    files: [`${libRoot}/src/**/*.{ts,tsx}`],

    settings: {
      "better-tailwindcss": {
        entryPoint: path.resolve(import.meta.dirname, libRoot, "src/styles/uno.generated.css"),
      },
    },
  })),

  UNOCSS_CONSUMER_APPS.map((appRoot) => ({
    files: [`${appRoot}/src/**/*.{ts,tsx}`],

    settings: {
      "better-tailwindcss": {
        entryPoint: path.resolve(import.meta.dirname, appRoot, "src/pages/uno.generated.css"),
      },
    },
  })),

  eslintPluginReact.configs.flat["jsx-runtime"],
  eslintPluginPrettierRecommended,
)
