---
name: npm-audit
description: Audits the bitcart-frontend pnpm workspace for vulnerable dependencies, fixes them with scoped overrides in pnpm-workspace.yaml, then sweeps existing overrides and minimumReleaseAgeExclude entries for ones upstream has made redundant. Use when asked to run a security or dependency audit, check dependencies for vulnerabilities, resolve `pnpm audit` findings, or review whether an override or exclude in pnpm-workspace.yaml is still needed.
---

# Audit and fix pnpm vulnerabilities

Fixing and sweeping are one pass, always in that order, every time this skill triggers. A pin added
minutes ago can already be stale, so staleness is checked after the fix pass, never instead of it.

All edits land in `pnpm-workspace.yaml`. Never add `resolutions`/`overrides` to an individual
`package.json` — this is a pnpm catalog workspace and overrides are workspace-wide. `pnpm why` and
`pnpm view` are read-only, safe to run freely; only `pnpm i` rewrites the lockfile.

## Quick start

```bash
pnpm audit                                           # find it
pnpm why <package>                                   # confirm the resolved version
pnpm view <parent>@<version> dependencies.<package>  # read the parent's declared range
# edit overrides: in pnpm-workspace.yaml
pnpm i && pnpm audit                                 # apply, then confirm
```

## Step 1: Fix new vulnerabilities

1. **`pnpm audit`.** The `Paths` column gives the chain, e.g. `apps__ui-docs>serve>ajv>fast-uri`.
   The vulnerable package's direct parent (`ajv` here) is what you reason about next.

2. **`pnpm why <vulnerable-package>`** to confirm the resolved version and every path to it, which
   the audit table alone doesn't make obvious in a multi-workspace monorepo.

3. **`pnpm view <parent>@<resolved-version> dependencies.<vulnerable-package>`** to read the
   parent's own declared range. This decides the whole workflow:
   - Range already permits the patched release → an override is safe.
   - Parent hard-pins an exact older version, or its range excludes the patch → report it and move
     to the next finding rather than guessing. See [REFERENCE.md](REFERENCE.md).

4. **Add the override, always** — even when the range already permits the patch, because a locked
   version that still satisfies its range will not move on its own
   ([REFERENCE.md](REFERENCE.md)). Comment it with exactly one TODO line, above the entry:

   ```yaml
   # TODO: Remove once <parent> bumps its <dep> floor to <patched-version>.
   <package>: ^<patched-version>
   ```

   That line is the whole comment. Don't describe the advisory, argue the override is safe, or
   record how you verified it — that belongs in your report to the user, not in the file, where it
   goes stale the moment upstream moves.

5. **Run `pnpm i`** (not `pnpm install`, not `pnpm add`), and say why before running it: editing the
   YAML changes nothing until pnpm re-resolves.

6. **On `ERR_PNPM_NO_MATURE_MATCHING_VERSION`**, add a dated exclude and move on. Never propose
   waiting for the maturity window to clear, or present waiting as an option
   ([REFERENCE.md](REFERENCE.md)).
   - `npm view <package> time --json` for the exact publish timestamp.
   - Add `<package>@<exact-version>` under `minimumReleaseAgeExclude:`, with one line above it:
     `# TODO: Remove after <publish-date + 7 days>`.
   - Re-run `pnpm i`. Report the exclude and its expiry — a report, not a permission request.

7. **`pnpm audit` again** and confirm "No known vulnerabilities found." Anything left unfixed under
   step 3 gets summarized rather than silently dropped; a partially-clean audit is a real outcome,
   just not a finished one.

## Step 2: Sweep for stale pins

1. **Every `overrides:` entry** — `pnpm why <package>`, then check the currently resolved parent's
   declared range with `pnpm view`. If the parent now reaches the patched version on its own, the
   override no longer changes anything and can go.

2. **Every _dated_ `minimumReleaseAgeExclude:` entry** — compare today against publish-date + 7
   days; a cleared window means it goes. Never touch the permanent undated entries, which are standing policy for fast-moving
   tooling rather than vulnerability fixes.

   An override and the exclude beside it are independent. An expired exclude goes even when its
   companion override is still load-bearing.

3. **Report a table before changing anything** — package, what currently pins it (or the
   publish-timestamp math), and still-needed vs. stale. The user should see the reasoning, not just
   a diff.

4. **Delete only confirmed-stale entries**, then run `pnpm i` and `pnpm audit` once more. A
   different chain than the one you checked can still resolve through an override that looked dead,
   so verifying after the edit matters as much as before it.
