---
name: npm-audit
description: Runs `pnpm audit` on the bitcart-frontend monorepo, fixes findings with scoped pnpm overrides in pnpm-workspace.yaml when safe, then sweeps the existing overrides/minimumReleaseAgeExclude entries for staleness and removes the ones upstream has since made redundant. One continuous pass, not two separate asks. Use this whenever the user asks to run a security/dependency audit, check for vulnerabilities, resolve `pnpm audit` findings, or review/clean up overrides or excludes in pnpm-workspace.yaml — even if they just say something like "check our dependencies for vulnerabilities" or "is this override still needed" without naming pnpm audit explicitly.
---

# Audit and fix pnpm vulnerabilities

This repo pins dependency resolutions in `pnpm-workspace.yaml`'s `overrides:` block rather than
waiting for transitive maintainers to bump their floors. Those pins go stale the moment upstream
catches up, so treat "fix what's vulnerable now" and "remove pins that are no longer doing anything"
as one continuous pass, run in that order, every time this skill triggers — not two separate
services picked based on how the user phrased the request. A pin you added minutes ago can already be
stale by the time you're done fixing everything else, so checking staleness only makes sense after
the fix pass, not before or instead of it.

Everything here targets `pnpm-workspace.yaml`, not any individual `package.json` — this is a pnpm
catalog workspace, and overrides are workspace-wide. Never add ad hoc `resolutions`/`overrides`
fields to individual `package.json` files here. `pnpm why` and `pnpm view` are read-only, safe to run
freely while investigating; only `pnpm i` changes the lockfile, and only editing
`pnpm-workspace.yaml` changes tracked source.

## Step 1: Fix new vulnerabilities

1. **Run `pnpm audit`.** Its output table includes a `Paths` column showing the dependency chain,
   e.g. `apps__ui-docs>serve>ajv>fast-uri`. That chain is your starting point, not a low-level detail
   to skip past — the _direct parent_ of the vulnerable package (here, `ajv`) is who you need to
   reason about next.

2. **Confirm the resolution with `pnpm why <vulnerable-package>`.** This shows every path to the
   package and the currently-resolved version, which the audit table alone doesn't always make
   obvious in a monorepo with multiple workspaces.

3. **Check whether an override would even be safe.** Run
   `pnpm view <parent>@<resolved-version> dependencies.<vulnerable-package>` to see the _parent's own
   declared range_ for the vulnerable dependency. This is the crux of the whole workflow:
   - If the parent's range (e.g. `^3.0.1`) already permits versions at or above the patched release
     (e.g. `3.1.5`), an override is safe — you're not violating the parent's own semver contract,
     just picking a higher version within what it already allows.
   - If the parent hard-pins an exact, older version, or its range genuinely excludes the patched
     version, forcing an override risks breaking the parent at runtime. Don't do this silently —
     tell the user the vulnerability exists but has no safe override path yet (upstream needs to
     bump first), and stop there for that finding. Move on to the next finding rather than guessing.

4. **Add the override**, following the exact style of the existing entries in `pnpm-workspace.yaml`'s
   `overrides:` block. Read a couple of the current entries first (e.g. `axios`, `postcss`) so new
   entries read as if the same person wrote them — this repo is consistent about explaining _why_
   before _what_. The pattern is:

   ```yaml
   #* <chain that pins the vulnerable version> - <what's wrong, in one line, referencing
   #* the CVE/advisory class if known>. <why the override is safe, e.g. "<parent>'s own
   #* range (<range>) already allows the patched release.">
   # TODO: Remove once <parent> bumps its <dep> floor to <patched-version>.
   <package>: ^<patched-version>
   ```

   Keep the comment block above the entry, not beside it — that's the established convention here,
   and it's what makes `git blame` on this file actually legible later.

5. **Explain to the user why an install step is needed before running one.** Editing the YAML alone
   changes nothing — pnpm only applies overrides when it re-resolves the lockfile. Then run `pnpm i`
   (not `pnpm install`, not `pnpm add` — this repo's `justfile` uses bare `pnpm i` for exactly this
   kind of lockfile-refresh, and CLAUDE.md reserves `pnpm add`/`pnpm install` for the `just add`/
   `just root-add` recipes that add genuinely new dependencies, which this isn't).

6. **If `pnpm i` fails with `ERR_PNPM_NO_MATURE_MATCHING_VERSION`**, this repo has a supply-chain
   policy (`minimumReleaseAge: 10080`, i.e. 7 days, near the top of `pnpm-workspace.yaml`) that
   refuses to install any version published within the last week — a defense against
   just-compromised packages before the ecosystem has had a chance to catch and pull them. When a
   patched version is legitimately too new:
   - Get its exact publish timestamp: `npm view <package> time --json`, and read the entry for the
     target version.
   - Ask the user whether to wait it out or add a _temporary, dated_ exclude — don't just add the
     exclude unilaterally, since it's a deliberate (if brief) bypass of a safety policy the repo
     opted into. If the wait is only a few hours, waiting may be the better default; if it's days,
     an exclude is usually more practical. Frame it as a real choice, not a formality.
   - If excluding: add `<package>@<exact-version>` under `minimumReleaseAgeExclude:` in
     `pnpm-workspace.yaml`, with `# TODO: Remove after <publish-date + 7 days>` above it — match the
     style of existing _dated_ entries there (e.g. `js-yaml@4.3.1`). Don't confuse these with the
     permanent, undated entries above them (`@base-ui/*`, `oxfmt`, `oxlint`, `@oxc-project/*`, etc.)
     — those are a standing policy for fast-moving pre-1.0/tooling packages, unrelated to any single
     vulnerability fix, and out of scope here.
   - Re-run `pnpm i`.

7. **Re-run `pnpm audit` and confirm "No known vulnerabilities found."** If findings remain because
   they had no safe override path (step 3), summarize those clearly to the user rather than reporting
   the task as done — a partially-clean audit is a real, useful outcome, just not a finished one.

## Step 2: Sweep for stale overrides and excludes

Once step 1 is settled, immediately check whether _any_ existing entry — including ones just added,
and ones untouched for a while — is now dead weight. An override or exclude stops mattering the
moment the upstream parent bumps its own floor past it; left in place it's harmless but it's noise
that obscures which pins are still load-bearing.

1. **For every entry under `overrides:`**, re-derive its parent chain with `pnpm why <package>`, then
   check that parent's _currently resolved_ version's own declared range with
   `pnpm view <parent>@<version> dependencies.<package>`. If that range has since moved to require (or
   even just permit-by-default-resolution) a version at or above the override's target on its own,
   the override no longer changes anything real and is safe to delete.

2. **For every _dated_ entry under `minimumReleaseAgeExclude:`** (i.e. one with a
   `# TODO: Remove after <date>` comment — never the permanent undated ones), compare today's date
   against publish-date + 7 days. If the window has cleared, the exclude is safe to delete; pnpm will
   resolve the version normally without it from that point on.

3. **Report findings as a table before changing anything** — package, what currently pins it (or the
   publish-timestamp math for excludes), and still-needed vs. stale. This mirrors how the step 1
   findings get reported: the user should see the reasoning, not just a diff.

4. **Only delete entries confirmed stale.** After deleting any, run `pnpm i` then `pnpm audit` to
   confirm the workspace is still clean — a stale-looking override can occasionally still be doing
   useful work if a _different_ chain than the one you checked also resolves through it, so verifying
   after the edit matters as much as verifying before it.
