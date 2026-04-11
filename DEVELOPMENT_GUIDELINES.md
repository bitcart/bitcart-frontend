# Development guidelines

## Environments

Currently, three types of environments are supported:

- `development` - default, for development purposes
- `testing` - for testing purposes
- `production` - for production deployments

The environment is specified by setting the `BITCART_ENV` environment variable.

Environment variables are validated with `@t3-oss/env-core` + Zod schemas. Client-side variables must be prefixed with `BITCART_`.

## Architecture

### Routing

Configured in `apps/<app>/src/pages/` and follows Vike file conventions:

- `+Page.tsx` — page component
- `+Layout.tsx` — layout wrapper
- `+config.ts` — route configuration
- `+Head.tsx` — SEO head tags
- `+title.ts` — page title

More information about routing in Vike can be found in the [Vike documentation](https://vike.dev/routing).

### i18n (Lingui)

Source locale: `en`.
The list of supported locales is available as `SUPPORTED_LOCALE_IDS` in `apps/<app>/constants.ts`.
Uses `useLingui()` hook with tagged template literals: `` t`text` ``.
Catalogs live in `src/common/i18n/_generated/locales/`.

Make sure to run `just extract-locales-dev` after adding/changing translatable strings.
For production builds, use `just extract-locales`.

### E2E Testing (Playwright)

Each app has its own `playwright.config.ts` and `e2e/` directory. Tests are `*.spec.ts` files, organized by concern (`pages/`, `i18n.spec.ts`, `ui-themes.spec.ts`, etc.). Shared test utilities, templates, and testid constants live in the `@bitcart/qa` package (`packages/qa/`).

- Landing: `apps/landing/e2e/` — port 3000
- Directory: `apps/directory/e2e/` — port 3001

The `webServer` config builds and starts preview servers via `just preview`. `reuseExistingServer` is currently disabled. Desktop Chrome only. CI uploads HTML report as artifact on failure.

## Code conventions

### Props type aliases

When a component's props type is a pure alias (no additional properties), intersect with `& {}` for flexibility and extensibility:

```ts
// ✅ correct
export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props & {}

// ❌ avoid — plain alias blocks future extension and is less explicit
export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props
```

Only add properties inside `{}` when the component actually introduces them.

### Early returns

Avoid standalone early returns. Instead, use `else return` to keep branches visually coupled:

```ts
// ✅ correct
if (condition) {
  return <Foo />
} else return <Bar />

// ❌ avoid — the dangling return obscures that these are two branches of the same condition
if (condition) {
  return <Foo />
}

return <Bar />
```

Only use a bare early return when it is a true guard clause (e.g. `if (!value) return null`) with no meaningful else branch.
