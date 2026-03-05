import path from "node:path"

import js from "@eslint/js"
import json from "@eslint/json"
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

export default defineConfig(
  { ignores: ["**/dist"] },

  {
    plugins: { json },
  },

  {
    files: ["**/*.json"],
    language: "json/json",

    rules: {
      "json/no-duplicate-keys": "error",
    },
  },

  {
    extends: [js.configs.recommended],
    files: ["**/*.{js,ts,tsx}"],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    rules: { "no-nested-ternary": "warn" },
  },

  ...[...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked].map(
    (config) => ({
      ...config,
      files: ["{apps,packages}/**/*.{ts,tsx}"],
      ignores: ["**/vite.config.ts", "*.js"],

      settings: {
        "import/resolver": { typescript: true },
      },

      languageOptions: {
        parser: eslintParserTypeScript,

        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },

      rules: {
        ...config.rules,

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
      },
    }),
  ),

  {
    files: ["{apps,packages}/**/*.{ts,tsx}"],

    plugins: {
      "@stylistic": stylisticPlugin,
      "@typescript-eslint": typescriptEslintPlugin,
      "better-tailwindcss": eslintPluginBetterTailwindcss,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      eslintPluginReact.configs.flat.recommended,
    ],

    languageOptions: {
      parser: eslintParserTypeScript,

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      "import/resolver": { typescript: true },
      react: { version: "19" },
    },

    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      ...eslintPluginBetterTailwindcss.configs["recommended-warn"].rules,
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,

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
      ],

      "@typescript-eslint/no-empty-object-type": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      "better-tailwindcss/enforce-consistent-line-wrapping": [
        "warn",
        { preferSingleLine: true, printWidth: 100 },
      ],

      "better-tailwindcss/no-unknown-classes": "off",

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

      //* Doesn't handle React.FC<TProps> and TS alone will suffice
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  ["packages/ui-kit"].map((appSubdir) => ({
    files: [`${appSubdir}/src/**/*.{ts,tsx}`],

    settings: {
      "better-tailwindcss": {
        entryPoint: path.resolve(import.meta.dirname, appSubdir, "src/styles/uno.generated.css"),
      },
    },
  })),

  ["apps/landing", "apps/directory"].map((appSubdir) => ({
    files: [`${appSubdir}/src/**/*.{ts,tsx}`],

    settings: {
      "better-tailwindcss": {
        entryPoint: path.resolve(import.meta.dirname, appSubdir, "src/pages/uno.generated.css"),
      },
    },
  })),

  eslintPluginReact.configs.flat["jsx-runtime"],
  eslintPluginPrettierRecommended,
)
