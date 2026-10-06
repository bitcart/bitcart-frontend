# Development guidelines

## MCPs

### Playwright

The Playwright MCP server lets agents drive the running apps in a real browser.

#### Optional configuration

In headless/containerized environments without a GPU, Chromium's GPU/zygote subprocess might crash on launch with `GPU process isn't usable. Goodbye.` (`error_code=1002`), even though `--no-sandbox` is already applied. The fix is the `--no-zygote` launch flag, the same workaround the apps' `playwright.config.ts` exposes for E2E via the `PLAYWRIGHT_CHROMIUM_NO_ZYGOTE` environment variable.

`@playwright/mcp` does **not** accept browser flags directly (`--no-zygote` → `error: unknown option '--no-zygote'`). Launch args can only be supplied through a JSON config file passed with `--config`. This repo ships [.agents/playwright-nogpu.config.json](.agents/playwright-nogpu.config.json) for exactly that:

```json
{ "browser": { "launchOptions": { "args": ["--no-zygote"] } } }
```

To enable it, the Playwright MCP server needs `--config` pointing at that file in its `args`. This is a **per-machine** concern (only headless/no-GPU setups need it).

Instead, add a **local-scope** override with `claude mcp add` (default scope is `local`):

```bash
claude mcp add playwright pnpx -- @playwright/mcp@latest \
  --browser chromium --config /absolute/path/to/bitcart-frontend/.agents/playwright-nogpu.config.json
```

- `local` is the default scope and needs no `--scope` flag.
- Use an **absolute** path for `--config` (it resolves against the MCP server's cwd).

> [!NOTE]
> Because `playwright` is now defined in both the local scope (your override) and the project scope (the committed `.mcp.json`), Claude Code prints a **conflicting-scopes warning** at startup. It's advisory only — the local endpoint is the one that runs, and the warning's caveat ("OAuth tokens are stored per endpoint") doesn't apply to Playwright, which uses no OAuth.

## Environments

Currently, three types of environments are supported:

- `development` - default, for development purposes
- `testing` - for testing purposes
- `production` - for production deployments

The environment is specified by setting the `BITCART_ENV` environment variable.

Only apps may vary their build output by environment. Library packages (`packages/*`) build identical output in every environment and share one Nx cache entry across all of them (`packageBuildInputs` in `nx.json`). A test build never replaces the `dist` read by a running dev server. To make a package build depend on `BITCART_ENV`, add `sharedGlobals` back to its build inputs.

Environment variables are validated with `@t3-oss/env-core` + Zod schemas. Client-side variables must be prefixed with `BITCART_`.

## Architecture

### Library packages

Packages under `packages/*` are compiled packages: tsdown builds each one into `dist` (JavaScript, `.d.ts` files and declaration maps), and their `exports` point there. Apps consume the same compiled output. Packages must stay usable by consumers outside Bitcart's control: apps never resolve package sources, whether through tsconfig `paths` or custom export conditions. Declaration maps (`declarationMap` in `packages/configs/src/by-package-type/lib-ts.json`) still take go-to-definition to the original source.

During development, the `watch-packages` target of the root `@bitcart/workspace` project rebuilds changed packages and their dependents. Every app's `dev` target depends on it, and Nx runs a single instance of it however many apps are started, including from separate terminals. Source-based resolution and per-package watch modes (`tsc --watch`, `vite build --watch`) were both tried before and dropped.

A package build never empties `dist` before it starts: a dev server or another build may be reading it. Once the build finishes, files not emitted by it are deleted (`staleOutputRemovalHooks` in `packages/configs/src/by-package-type/lib-tsdown.ts`). Each tsdown config sets `clean: false` and registers these hooks.

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
The list of supported locales is available as `SUPPORTED_LOCALE_IDS` in `apps/<app>/constants.ts`, re-exported from `@bitcart/core/i18n`, which every package catalog covers.
Uses `useLingui()` hook with tagged template literals: `` t`text` ``.
Catalogs live in `src/common/i18n/_generated/locales/` in apps and in `src/i18n/_generated/locales/` in packages with translatable text (UI Kit, Form Kit). A package's catalog is extracted and translated once, in the package, and apps merge it into their own at runtime. All catalogs are gitignored: Transifex holds the translations.

Which form to use depends on where the text is translated: a component, a function called during render, a module-level constant, or code outside render. Load the `lingui` skill before adding or changing translatable text: the wrong form keeps the old language after a locale switch under React Compiler.

Make sure to run `just locales-extract-dev` after adding/changing translatable strings: it covers apps and packages.
For production builds, use `just locales-extract`.

### E2E Testing (Playwright)

Each app has its own `playwright.config.ts` and `e2e/` directory. Tests are `*.spec.ts` files, organized by concern (`pages/`, `i18n.spec.ts`, `ui-themes.spec.ts`, etc.). Shared test utilities, templates, and testid constants live in the `@bitcart/qa` package (`packages/qa/`).

- Landing: `apps/landing/e2e/` — port 4000
- Directory: `apps/directory/e2e/` — port 4001
- Checkout: `apps/checkout/e2e/` — port 4002

E2E runs alongside `just dev` and never tests a dev server: the `webServer` config starts a preview of the app's build via `pnpm preview` on a dedicated E2E port. `reuseExistingServer` is enabled, and a server already answering on the E2E port is reused. Within the workspace, only another E2E preview of the same app (e.g. one kept up by `just e2e-ui`) listens on that port. The preview binds its port strictly and fails to start when the port is taken. Desktop Chrome only. CI uploads HTML report as artifact on failure.

#### Page readiness: `waitUntilHydrated`, not `networkidle`

When a template needs the page to be interactive before asserting, navigate with a plain `page.goto(path)` (default `load`) followed by `waitUntilHydrated(page)`. Do **not** gate readiness on `page.goto(path, { waitUntil: "networkidle" })`: pages may issue background requests to external/flaky services (e.g. the Bitcart API on the Coins page), so the network never goes idle and the navigation hangs until timeout. Hydration (`data-is-hydrated="true"`) is the correct, network-independent readiness signal. `networkidle` is fine only for non-interactive concerns like full-page screenshots.

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

### Blank lines around multiline blocks

Surround any multiline block with blank lines: one before it when anything comes before, and one after it when anything comes after. This applies to every construct with some approximation of a "block": statements (`if`/loops/function declarations), multiline object or array members, `switch` cases, sibling JSX elements, and so on. Single-line siblings may stay clustered together; the padding is only required around constructs that span multiple lines. See [packages/unocss-preset/src/index.ts](packages/unocss-preset/src/index.ts) for a representative real-world example.

```ts
// ✅ correct — multiline members padded on both sides, single-line ones clustered
const syncOptions = {
  name: "catalog-sync",
  retries: 3,
  timeout: 30_000,

  hooks: {
    onError: (error: Error) => logger.report(error),
    onRetry: () => metrics.increment("catalog-sync.retry"),
  },

  buildTargets: (env: Environment) =>
    env === "production" ? PRODUCTION_TARGETS : [...PRODUCTION_TARGETS, ...PREVIEW_TARGETS],
}

// ❌ avoid — multiline members glued to their neighbors read as one lump
const syncOptions = {
  name: "catalog-sync",
  retries: 3,
  timeout: 30_000,
  hooks: {
    onError: (error: Error) => logger.report(error),
    onRetry: () => metrics.increment("catalog-sync.retry"),
  },
  buildTargets: (env: Environment) =>
    env === "production" ? PRODUCTION_TARGETS : [...PRODUCTION_TARGETS, ...PREVIEW_TARGETS],
}
```

```tsx
// ✅ correct
<Button variant="accent" size="sm">
  Accent sm
</Button>

<Button variant="accent" size="default">
  Accent default
</Button>

// ❌ avoid
<Button variant="accent" size="sm">
  Accent sm
</Button>
<Button variant="accent" size="default">
  Accent default
</Button>
```

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

Only the last branch of an if-else chain stays unwrapped, and only when its body is a single `return` that still fits on the condition's line. Braces stay on every branch ahead of the last one:

```ts
// ✅ correct
if (issues.length > 0) {
  return issues.join("; ")
} else if (typeof detail === "string") {
  return `${label}: ${detail}`
} else if (typeof label === "string") {
  return label
} else if (typeof message === "string") return message

// ❌ avoid — a branch with an `else` after it is unwrapped, breaking the chain across two statements
if (issues.length > 0) {
  return issues.join("; ")
} else if (typeof detail === "string") {
  return `${label}: ${detail}`
} else if (typeof label === "string") return label
else if (typeof message === "string") return message
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
