---
name: lingui
description: Conventions for translatable strings in this workspace with Lingui 6 (`@lingui/core`, `@lingui/react`, their `/macro` entries). Covers which form to use where (`useLingui()` `t`, an `i18n` parameter with `i18n.t(msg…)`, module-level `msg`, the global `t`) so translations follow locale switches under React Compiler. Use when adding or changing user-facing text, touching `t`, `msg`, `Trans`, `useLingui`, `I18nProvider` or a layout config factory, writing a helper that returns translated text, or when a translation stays in the old language after a locale switch.
---

# Lingui

React Compiler caches every value a component or hook computes during render, keyed on the inputs it can see: props, state, context and hook results. The global `i18n` instance from `@lingui/core` is none of these, so text translated through it during render keeps the first locale forever. `useLingui()` returns a new `t` and a new `i18n` (a Proxy over the same global instance) on every locale switch and catalog load, which makes them inputs the compiler tracks.

## Which form where

| Where the text is translated                                                               | Use                                                                                                  |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Component or hook body, JSX included                                                       | `const { t } = useLingui()` from `@lingui/react/macro`, then `` t`…` ``                              |
| Plain function called during render (a layout config factory, a helper)                    | An `i18n: I18n` parameter, passed the `i18n` from `useLingui()`, and ``i18n.t(msg`…`)`` inside       |
| Module-level table or constant                                                             | `` msg`…` `` from `@lingui/core/macro`, translated at render with `t(descriptor)` from `useLingui()` |
| Outside render: effect and event handler bodies, Zod error maps, router `head` and loaders | The global `` t`…` `` from `@lingui/core/macro`                                                      |

References: `apps/checkout/src/checkout/parts/status-overlay.tsx` (module-level `msg` table), `apps/landing/src/pages/layout.config.ts` with its caller `apps/landing/src/pages/+Layout.tsx` (`i18n` parameter), `packages/ui-kit/src/components/organisms/website-footer.tsx` (`useLingui()` plus `getTargetBlankA11yHint(i18n)`), `apps/checkout/src/checkout/copy.ts` (global `t` inside an effect).

## Rules

- Never call the global `t` in a component or hook body, nor in a function called from one. A function with no arguments is cached once and never runs again. Adding an `i18n` parameter only to invalidate that cache while translating with the global `t` still breaks with a second instance, and silently regresses when the parameter is removed.
- Never use `` t(i18n)`…` ``: it's deprecated since Lingui 5. Use ``i18n.t(msg`…`)`` instead.
- Don't wrap translations in `useMemo` or `useCallback`: React Compiler memoizes them. Lingui's native macro transform compiles a `t` dependency to a different binding than the `t` calls, so the compiler can't preserve such a memo and skips optimizing the whole component. Memoizing a factory on the reactive instance, `useMemo(() => getLayoutConfig(i18n), [i18n])` with `i18n` from `@lingui/react`, is fine: no macro rewrites it.
- Outside render, translate inside the callback itself. A string built during render and only used by an effect is a render value and gets cached like one. The global `t` there is correct when the callback runs but not reactive: text it already produced, such as a displayed validation error or a page title, keeps its language until the code runs again.
- Shared packages (`packages/*`) never create an `I18nProvider` and never load or activate catalogs: the app owns both. They read translations through `useLingui()` only.
- A package with translatable text owns its catalog: its own extraction, its own Transifex resource, and a build that compiles its macros and catalogs. It exports `load<Package>Messages` and `<PACKAGE>_SOURCE_LOCALE_MESSAGES` from `<package>/i18n`, and each app using it merges that catalog into its own with `combineLocaleLoaders`, the app's loader last. Apps never include package sources in their Lingui config.
- Components that call `useLingui()` throw outside an `I18nProvider`, tests included. Checkout tests render through `CheckoutTestProviders` from `apps/checkout/src/checkout/testing`.
- In apps' Vite configs, the Lingui macro transform must run before React Compiler. Otherwise the compiler hoists JSX out of `<Trans>`, and the message id no longer matches the catalog.

## A package's catalog

`packages/ui-kit` is the reference. Giving another package its own catalog takes:

- `lingui.config.ts` from `defineLibLinguiConfig` (`@bitcart/configs/by-package-type/lib-lingui`), registered as a knip entry in `knip.config.ts`.
- `src/i18n/index.ts` exporting the loader and the source catalog, added to the tsdown entries and `package.json` exports.
- `linguiMacrosPlugin` with `descriptorFields: "message"` and `linguiCatalogsPlugin` in the tsdown config, from `@bitcart/configs/supplementary/*`.
- An `i18n:extract-locales` script, and a `project.json` whose build depends on it and lists `packageCatalogs` in its inputs.
- `.tx/config` for a resource in the `bitcart-ui` Transifex project.
- In every app that uses the package, its loader in `src/common/i18n`, and the package in the app's dependencies.

## Gotchas

- A message id is a hash of the message and its context: identical text gets one id and one translation everywhere. Pass `context` when the same English text needs different translations.
- `` t`…` `` and `` msg`…` `` with the same text produce the same id, so switching between the forms keeps existing translations.
- Run `just locales-extract-dev` after adding or changing translatable text.
