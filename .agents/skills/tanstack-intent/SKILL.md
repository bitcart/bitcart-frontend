---
name: tanstack-intent
description: Loads official TanStack Router, TanStack Start, and TanStack Devtools guidance on demand through the `@tanstack/intent` CLI, which serves docs that ship inside the installed packages themselves. Use this before writing or changing anything in a TanStack app in this workspace (any app whose `package.json` pulls in `@tanstack/react-router` or `@tanstack/react-start`) that touches file routes, `createFileRoute`, loaders, `beforeLoad`, search params, path params, `createServerFn`, server routes, middleware, SSR or streaming, code splitting, route masking, `notFound`/error components, devtools plugins, or the router/devtools Vite plugins. Reach for it even when the request sounds routine ("add a route", "read a query param", "protect this page behind login", "why is this loader running twice") and never mentions TanStack by name, since the local docs answer those far better than recall does. Also use it when asked what intent is, or which skills a given package ships.
---

# TanStack Intent

`@tanstack/intent` is TanStack's way of shipping agent-readable docs inside published npm
packages. Every `@tanstack/*` package this repo installs carries `SKILL.md` files in its tarball,
and the CLI discovers them across `node_modules` and prints them on request. Each one runs a few
hundred lines of version-matched, example-heavy guidance, which is exactly the kind of material
that is expensive to keep in context speculatively and cheap to fetch once you know you need it.

Which apps this applies to isn't worth memorizing as a list, since the answer is derivable and the
list would rot: run `list` (below) from the app you're editing and take what it prints. Apps built
on Vike rather than TanStack Router return nothing at all, which is itself the answer.

`intent install` can inline the whole catalog of skill blurbs into an app's `AGENTS.md`. This
repo deliberately doesn't: that costs several KB of always-on context for a list `intent list`
reproduces on demand and, unlike a checked-in copy, never drifts from what's actually installed.
Please don't run `intent install` or `intent hooks install`. If the catalog ever needs to be
materialized for a non-Claude agent that can't read skills, that's a deliberate call for the user
to make, not a convenience to add silently.

## Loading a skill

1. **List what's available, from the directory of the app you're working in.**

   ```bash
   cd apps/<app> && pnpm dlx @tanstack/intent@latest list
   ```

   The working directory is what scopes the result: discovery resolves against that directory's
   dependency graph, so each app reports only what it installs and two apps will differ. The repo
   root resolves against pnpm's hoisted store, which is no single app's graph and will happily
   offer you skills the app you're editing can't use.

   Note that intent isn't TanStack-only. `dotenv` publishes skills too, so don't read a
   non-TanStack entry as a discovery bug.

2. **Load the one that matches, quoting the id** so the shell doesn't treat `#` as a comment:

   ```bash
   pnpm dlx @tanstack/intent@latest load '@tanstack/router-core#router-core/search-params'
   ```

3. **Follow the `requires:` chain.** Sub-skills declare their parents in frontmatter, e.g.
   `search-params` requires `router-core`. Loading the sub-skill alone gives you the specifics
   without the model of route trees and matching they assume, so load the parent too unless you
   already have that context from earlier in the session.

Loading one or two skills is the normal case. If a task seems to need four or five, that usually
means the task should be broken up, not that you should bulk-load the catalog.

## What intent does and doesn't cover

Skills exist for `@tanstack/router-core`, `start-client-core`, `start-server-core`,
`react-start`, `router-plugin`, `virtual-file-routes`, `devtools`, `devtools-event-client`, and
`devtools-vite`. `@tanstack/react-query`, `react-store`, and `store` ship **no** intent skills
even where they're direct dependencies, so don't go hunting for one when a task is about queries
or stores. Use context7 for those instead.

Several skills cover things this repo isn't doing at all (publishing a devtools plugin to the
marketplace, migrating off Next.js App Router, deploying to Cloudflare or Vercel). A blurb
matching some keywords in the request isn't sufficient reason to load it.

## Trusting what you get back

Skill frontmatter carries a `library_version`, and it can lag the version actually installed. The
repo also has more than one `@tanstack/router-core` in the store, so `list` warns about multiple
variants and picks one. Both are normal and neither makes the guidance useless, but when a skill
describes an API that the installed typings disagree with, the typings win. Say so rather than
writing code against the doc and letting `just typecheck` discover it later.
