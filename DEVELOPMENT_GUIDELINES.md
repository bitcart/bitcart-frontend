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

Make sure to run `just locales-extract-dev` after adding/changing translatable strings.
For production builds, use `just locales-extract`.

### E2E Testing (Playwright)

Each app has its own `playwright.config.ts` and `e2e/` directory. Tests are `*.spec.ts` files, organized by concern (`pages/`, `i18n.spec.ts`, `ui-themes.spec.ts`, etc.). Shared test utilities, templates, and testid constants live in the `@bitcart/qa` package (`packages/qa/`).

- Landing: `apps/landing/e2e/` — port 3000
- Directory: `apps/directory/e2e/` — port 3001

The `webServer` config builds and starts preview servers via `just preview`. `reuseExistingServer` is currently disabled. Desktop Chrome only. CI uploads HTML report as artifact on failure.

## Code conventions

### Comments

Single-line prose comments should always carry a semantic tag supported by the [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) VSCode extension. The tag makes the intent of the comment visible at a glance and lets the editor color-code it. The workspace configures the tag set under `better-comments.tags` in [.vscode/settings.json](.vscode/settings.json):

- `//!` — alerts, caveats, non-obvious constraints
- `//?` — open questions or things that need review
- `//*` / `//#` — regular notes
- `// todo` — work to be done (case-insensitive)

Untagged single-line comments are reserved for **commented-out code fragments** — temporarily disabled to be re-enabled or deleted soon.

```ts
// ✅ correct — semantic tag signals the role
//! Must be called before tokenization; otherwise the index is stale.
hydrateCache()

// ✅ correct — untagged comment for disabled code
// import { experimentalFlag } from "./flags"

// ❌ avoid — ambiguous prose note with no tag
// must be called before tokenization
hydrateCache()
```

The `stylistic-js/lines-around-comment` rule in [packages/configs/src/base/oxlint.ts](packages/configs/src/base/oxlint.ts) enforces a blank line before tagged comments so they stand out, but ignores untagged ones so commented-out code doesn't force awkward spacing. Keep the oxlint `ignorePattern` in sync with `better-comments.tags` when either list changes.

### Theme-aware colors

Don't hardcode color values (e.g. `bg-white`, `text-purple-700`, `border-gray-200`, raw hex/rgb/oklch) in application and shared UI components. Use semantic tokens from the active theme instead — either from the app's UnoCSS config at `apps/<app>/uno.config.ts` (which can extend/override `colorScheme`) or from the preset's built-in default scheme declared in [packages/unocss-preset/src/color-scheme.ts](packages/unocss-preset/src/color-scheme.ts).

Typical semantic classes:

- Surface: `bg-background` / `text-foreground`, `bg-card` / `text-card-foreground`, `bg-popover` / `text-popover-foreground`
- Primary/secondary/accent: `bg-primary` / `text-primary-foreground`, `bg-secondary` / `text-secondary-foreground`, `bg-accent` / `text-accent-foreground`
- Muted: `bg-muted` / `text-muted-foreground`
- Destructive: `bg-destructive` / `text-destructive-foreground`
- Borders / focus rings: `border-border`, `border-input`, `ring-ring`

```tsx
// ❌ avoid — these break when the app theme or dark mode changes
<span className="bg-white text-purple-700">{t`NEW`}</span>

// ✅ correct — tracks the active theme in both light and dark modes
<span className="bg-primary-foreground text-primary">{t`NEW`}</span>
```

The only time hardcoded colors are justified is when a one-off component is _designed_ to look the same regardless of the current app theme (e.g. a branded badge reproduced from an external asset, a print-only section, a marketing ribbon that must match a specific partner palette). In those cases, add a short comment explaining why the color is pinned.

### Utility classes in non-UnoCSS packages

Library packages that don't have their own UnoCSS config (e.g. `packages/vike-kit`, `packages/core`, `packages/form-kit`) are **not scanned** by any app's UnoCSS pipeline. Apps only scan their own `src/**` and `packages/ui-kit/src/**` (see `apps/<app>/uno.config.ts`).

Do **not** use Tailwind / UnoCSS utility classes inside such packages unless every class used is present in `presetBitcart`'s `safelist` (see [packages/unocss-preset/src/index.ts](packages/unocss-preset/src/index.ts)). Otherwise those classes won't be generated and the markup will render unstyled — which, for utilities like `sr-only` or visibility clips, can silently break accessibility or layout (e.g. unclipped screen-reader text causing horizontal overflow).

If you need a utility that isn't safelisted, either add it to the safelist or move the component into `packages/ui-kit` (which is scanned).

```tsx
// ❌ avoid — in packages/vike-kit, these classes won't be generated
<span className="absolute w-px h-px p-0 -m-px overflow-hidden [clip:rect(0,0,0,0)]">
  {" (opens in new tab)"}
</span>

// ✅ correct — `sr-only` is safelisted in presetBitcart
<span className="sr-only">{" (opens in new tab)"}</span>
```

### UI Kit imports

When working on UI kit components (`packages/ui-kit/src/components`), always import locally defined primitives rather than the ones provided by libraries like Base UI. The UI Kit wraps headless primitives with project-specific styling, props, and behavior — importing them directly bypasses all of that. The exception is when implementing a new low-level wrapper, where importing from external packages is expected.

IDE auto-import often suggests the primitive package first because it appears earlier in the dependency tree. Always double-check the import source before accepting.

```tsx
// ❌ avoid — imports the raw primitive, bypasses custom wrapper
import { DrawerTrigger } from "@base-ui/react"

// ✅ correct — uses the project's wrapped component
import { DrawerTrigger } from "../atoms/drawer"
```

### Props type aliases

When a component's props type is a pure alias (no additional properties), intersect with `& {}` for flexibility and extensibility:

```ts
// ✅ correct
export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props & {}

// ❌ avoid — plain alias blocks future extension and is less explicit
export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props
```

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

Only use a bare early return when it is a true guard clause at the very top of a function (e.g. `if (!value) return null`) with no meaningful else branch and with an explicit return type:

```ts
// ✅ correct
const handleMobileMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
  if (e.key !== "Tab") return void null

  const focusable = Array.from(
    mobileMenuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? [],
  )

  if (focusable.length) {
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}, [])

// ❌ avoid
const handleMobileMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
  if (e.key !== "Tab") return

  const focusable = Array.from(
    mobileMenuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? [],
  )

  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  }

  if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}, [])
```
