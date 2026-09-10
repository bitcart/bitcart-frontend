# Reference: pnpm override and exclude rationale

Background for the judgement calls in [SKILL.md](SKILL.md). Read the relevant section when a
finding is ambiguous; skip it otherwise.

## Why add an override even when the range already permits the patch

`pnpm i` does not re-resolve a dependency that is already locked at a version still satisfying its
declared range. A permissive range plus a fresh install leaves the vulnerable version sitting in
the lockfile untouched — the override is what actually moves it.

Concretely: postcss declaring `nanoid: ^3.3.16` does _not_ mean `pnpm i` picks up the patched
3.3.17 by itself once 3.3.16 is locked. Only `nanoid: ^3.3.17` under `overrides:` forces it.

This is why step 4 says to add the override unconditionally, rather than reasoning about whether a
from-scratch resolution would have picked the patched version.

## Why a parent's hard pin is a stop condition

When a parent declares a range, overriding within that range keeps the parent's own semver contract
intact — you are picking a higher version it already said it accepts. When a parent pins an exact
version instead, an override overrules a constraint the maintainer chose deliberately, and nothing
guarantees the parent still works.

That is why the parent's declared range, not the advisory's patched range, is what step 3 checks.

The stop is about not deciding silently, not about the override being impossible. A scoped
`"<parent>><dep>": ^<patched>` entry confines the forced version to that one parent, leaving every
other consumer on normal resolution, and is the right shape when the user decides the risk is
acceptable. Two things make that call much safer, and both are worth checking before handing the
decision over:

- The parent exact-pins _every_ dependency as a matter of policy, so the pin says nothing about
  compatibility with this particular package.
- Another package in the same workspace already resolves the patched version, so it is known to
  coexist with the rest of the tree.

Report what you found either way. The user decides.

## Why the maturity window is never something to wait out

`minimumReleaseAge: 10080` (7 days, near the top of `pnpm-workspace.yaml`) refuses any version
published within the last week — a defense against a just-compromised package before the ecosystem
has had a chance to catch and pull it.

When a patched version is legitimately too new, the exclude is the fix and waiting is not. An open
high-severity advisory sitting in the lockfile for days is the larger risk, and "come back later
and re-run `pnpm i`" is not something anyone reliably performs. The exclude is narrow by
construction: one exact version, carrying its own removal date, swept up by step 2 on a later run.

## Dated excludes vs. permanent ones

`minimumReleaseAgeExclude:` holds two unrelated kinds of entry.

Permanent, undated entries (`@base-ui/*`, `oxfmt`, `oxlint`, `oxlint-tsgolint`, `@oxc-project/*`,
and the binding globs) are standing policy for fast-moving pre-1.0 and tooling packages that ship
faster than the maturity window allows. They have nothing to do with any vulnerability fix and are
out of scope for this skill.

Dated entries carry a `# TODO: Remove after <date>` line and are exactly what step 1 adds, so
expect step 2 to be cleaning up after previous runs.

One trap: a version-scoped name and a glob are not interchangeable. pnpm rejects a pattern that
carries a version, so a package whose platform binaries are published as a family
(`@scope/pkg-*`) can only be excluded unversioned. An unversioned glob keeps waving through every
future release of those packages, so it must be removed as soon as the dated entry beside it
expires.
