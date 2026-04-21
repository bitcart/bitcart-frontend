# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bitcart frontend monorepo containing two web applications and shared packages. Built with React 19, Vike (file-based routing SSR framework), TypeScript, and UnoCSS.

## Monorepo Structure

- **apps/landing** — Bitcart.ai landing website
- **apps/directory** — Merchants directory website
- **packages/core** — Foundational utilities, types, Zod schemas, i18n utilities
- **packages/ui-kit** — Reusable React component library (atomic design: atoms/molecules/organisms/templates) with shadcn/ui + UnoCSS
- **packages/form-kit** — Form utilities using TanStack React Form
- **packages/vike-kit** — Shared Vike configuration, i18n, navigation, telemetry, metadata
- **packages/unocss-preset** — Custom UnoCSS styling preset
- **packages/qa** — Shared Playwright test utilities, templates, and testid constants
- **packages/configs** — Shared configurations (TypeScript, oxlint, dependency-cruiser, etc.)

## Commands

All commands use `just` (command runner). Run `just` to see available recipes.

```bash
just dev                    # Start all dev servers (installs deps, watches styles + runs Vike)
just build                  # Build all packages
just format                 # Auto-format code (oxfmt)
just lint                   # Lint with autofix (oxlint)
just fix                    # Format + lint (auto-fix)
just format-check           # Verify formatting without fixing
just lint-check             # Verify linting without fixing
just typecheck              # Type checking
just check                  # All checks: format-check + lint-check + typecheck (no tests)
just test                   # Run all tests
just ci                     # Full CI pipeline: check + test
just locales-extract        # Extract i18n catalogs for all apps
just locales-extract-dev    # Extract i18n catalogs with pseudo locale (for dev)
just e2e                    # Run all Playwright E2E tests
just e2e-app landing        # Run E2E tests for a specific app
just e2e-ui landing         # Open Playwright interactive UI for a specific app
just e2e-report landing     # Open HTML test report for a specific app
just e2e-setup              # Install Playwright browsers (Chromium)
```

To target a specific workspace package via Nx:

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

UnoCSS with a custom `@bitcart/unocss-preset`. Styles are generated to `src/pages/uno.generated.css` (auto-generated, do not edit). The UI Kit uses shadcn/ui patterns with Base UI primitives and Class Variance Authority (CVA) for variants.

### Data Fetching

TanStack React Query via `vike-react-query` for server/client data synchronization.

## Conventions

- **Package manager:** pnpm (strict catalog mode for dependency versions in `pnpm-workspace.yaml`)
- **Task runner:** Nx for caching and orchestration across workspace packages
- **Path aliases:** `@/*` → `./src/*` per app; `@bitcart/*` → workspace packages
- **Formatting:** oxfmt (no semicolons, double quotes, 100 char width)
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
