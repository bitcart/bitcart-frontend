# Agents configuration

## Project Overview

Bitcart frontend monorepo containing web applications, shared packages and app templates. Built with React 19, TypeScript and UnoCSS. Landing and Directory run on Vike, Checkout and UI Docs on TanStack Start; both are file-based routing frameworks.

## Monorepo Structure

- **apps/checkout** — Invoice checkout application (TanStack Start)
- **apps/directory** — Merchants directory website (Vike)
- **apps/landing** — Bitcart.ai landing website (Vike)
- **apps/ui-docs** — UI Kit documentation site built on Fumadocs (TanStack Start)
- **packages/api-sdk** — TypeScript SDK for the Bitcart Merchants API. orval generates the raw client, Zod schemas and MSW mocks from a pinned OpenAPI schema into the three `generated/` directories; everything else is authored, including the per-tag `endpoints/` wrappers and hooks, `auth/`, `utils/` and the SDK configuration. Only the `generated/` trees are safe to overwrite
- **packages/configs** — Shared configurations (TypeScript, oxlint, dependency-cruiser, etc.)
- **packages/core** — Foundational utilities, types, Zod schemas, i18n utilities
- **packages/form-kit** — Form utilities using TanStack React Form
- **packages/hooks** — Framework- and presentation-agnostic, SSR-safe React hooks
- **packages/qa** — Shared Playwright E2E utilities, test templates, testid constants, and unit test mocks
- **packages/ui-kit** — Reusable React component library (atomic design: atoms/molecules/organisms/templates) with shadcn/ui + UnoCSS
- **packages/unocss-preset** — Custom UnoCSS styling preset
- **packages/vike-kit** — Shared Vike configuration, i18n, navigation, telemetry, metadata
- **templates/vike-app** — Minimal Vike application boilerplate

## Commands

All commands use `just` (command runner). Run `just` to see available recipes.

```bash
just dev                    # Install dependencies, then start every dev server
just preview                # Serve a production preview of every app
just build                  # Build every workspace member
just build-packages         # Build library packages only, excluding apps
just format                 # Auto-format code (oxfmt)
just lint                   # Lint with autofix (oxlint)
just fix                    # Format + lint (auto-fix)
just format-check           # Verify formatting without fixing
just lint-check             # Verify linting without fixing
just typecheck              # Type checking
just depcheck               # Detect unused dependencies, files, and exports (knip)
just depcruise              # Verify emitted dist code never references a devDependency
just check                  # All checks: api-check, format-check, lint-check, typecheck, depcheck, depcruise
just unit                   # Run unit tests (vitest)
just unit-dev               # Run unit tests in watch mode
just test                   # Run all tests: unit + e2e
just ci                     # Full CI pipeline: check + test
just locales-extract        # Extract i18n catalogs for all apps
just locales-extract-dev    # Extract i18n catalogs with pseudo locale (for dev)
just e2e                    # Run all Playwright E2E tests
just e2e-app landing        # Run E2E tests for a specific app
just e2e-ui landing         # Open Playwright interactive UI for a specific app
just e2e-report landing     # Open HTML test report for a specific app
just e2e-setup              # Install Playwright browsers (Chromium)
just list-members           # List all workspace members
```

The API SDK's `generated/` trees are committed to the repository, and these recipes rewrite them. Authored SDK code is untouched by all three:

```bash
just api-generate           # Regenerate the SDK from the pinned OpenAPI schema
just api-check              # Verify the committed SDK still matches the pinned schema
just api-sync <source>      # Pin a fresh schema from a backend URL or an exported file, then regenerate
```

Recipes taking Nx arguments accept `-p <member>` to narrow the run, as in `just dev -p ui-docs`. To target a specific workspace package via Nx:

```bash
pnpm nx run landing:dev     # Dev server for landing only
pnpm nx run directory:build # Build directory only
```

**Installing dependencies:** Never run `pnpm add` or `pnpm install` directly. Use these `just` commands instead:

```bash
just root-add <package>              # Add dependency to workspace root
just root-add-dev <package>          # Add dev dependency to workspace root
just add <ws-member> <package>       # Add dependency to a workspace package
just add-dev <ws-member> <package>   # Add dev dependency to a workspace package
```

## Architecture

### Styling

UnoCSS with a custom `@bitcart/unocss-preset`. Every app declares its own stylesheet destination under `cli.entry.outFile` in `apps/<app>/uno.config.ts`: the Vike apps emit `src/pages/uno.generated.css`, the TanStack Start apps `src/routes/-layout/uno.generated.css` (auto-generated, do not edit). UI Docs also runs Tailwind through `@tailwindcss/vite`, which backs the Fumadocs stylesheets imported in `apps/ui-docs/src/routes/-layout/app.css`. The UI Kit uses shadcn/ui patterns with Base UI primitives and Class Variance Authority (CVA) for variants.

### Data Fetching

TanStack React Query for server/client data synchronization, integrated per framework: Landing and Directory through `vike-react-query`, Checkout through `@tanstack/react-router-ssr-query`. UI Docs has no query layer; its content is resolved at build time by `fumadocs-mdx`.

## Conventions

- **Package manager:** pnpm (strict catalog mode for dependency versions in `pnpm-workspace.yaml`)
- **Task runner:** Nx for caching and orchestration across workspace packages
- **Path aliases:** `@/*` → `./src/*` per app; `@bitcart/*` → workspace packages
- **Scripts and configs:** TypeScript only — the repo has no `.js`, `.mjs` or `.cjs`. Node runs `.ts` directly (`#!/usr/bin/env node`). Fall back to JS only when a caller cannot load TypeScript, and then use `.js`. Every package's root tsconfig `include` ends with `"*.ts", ".*.ts"`. Keep the second entry: TypeScript wildcards skip dotfiles, and a bare `"*.ts"` would silently drop `.dependency-cruiser.ts`
- **Formatting:** oxfmt, the only formatter — it handles all file types, not just JS/TS, so pass it any path. JS/TS style: no semicolons, double quotes, 100 char width
- **Imports:** Ordered by: builtin → external → internal (`@bitcart/*`) → siblings/parent
- **Unused params:** Prefix with `_` (e.g., `_event`)
- **Components:** Add new shadcn primitives via `just add-ui-kit-components <component>`
- **Pre-commit hooks:** Run via `just pre-commit`. Checks: lint, typecheck, format, merge conflicts, private keys
- **Node version:** Managed via `.nvmrc` (use `fnm`)

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## See more

@DEVELOPMENT_GUIDELINES.md
