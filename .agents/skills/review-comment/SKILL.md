---
name: review-comment
description: How to decide what belongs in a code review and how to publish it as a pull request comment or a follow-up cleanup issue. Use whenever reviewing or re-reviewing a PR on git.bitcart.ai, writing or amending review findings destined for one, or writing a cleanup issue that comes out of a review. Covers what qualifies as a finding, how severity is assigned, when to stop reviewing, and the shared worklist format.
---

# Reviewing a pull request

A review is a decision aid, not a defect inventory. Its only value is the author's confidence that everything in it deserves their attention, and that confidence is spent rather than renewed — each item they read and dismiss makes the next one cheaper to ignore.

The failure mode is structural. You were asked to find problems, so you will find problems: keep magnifying and any codebase dissolves into things that are technically true and practically worthless. Everything below exists to stop the magnification at the point where findings stop being worth reading.

## The gate

Answer all three for every candidate finding. If any answer is no, **drop it** — do not demote it to a nit.

1. **Can you name the failure?** Give a concrete sequence that produces a wrong result, data loss, or a user-visible break, using only what is in the repo today. If the sequence needs "if someone later adds", "if the backend changes", or "an attacker could theoretically", there is no failure.
2. **Is the code reachable?** It has to run in a shipped path. Scaffolding, unmounted components, unexported helpers and unreferenced modules are not.
3. **Does it survive "so what?"** If the honest answer is "it would be obvious immediately and cheap to fix", it is not a finding.

## Delete what you talked yourself out of

While writing an item you will sometimes reason your way to the conclusion that it does not matter. That conclusion is the verdict. Delete the item — do not publish it with the caveat attached just because you already wrote the setup.

A finished item containing any of these failed the gate and must be removed, not softened:

> harmless today · self-healing · theoretical · currently degenerate · would only matter if · not currently reachable · blast radius is limited · worth noting · for completeness · on a future addition

## Never report

- **Anything the toolchain already owns.** Whatever `just check` runs — linting, formatting, types, dead code, unused dependencies, module boundaries, codegen drift — is settled while it is green. Do not hand-audit those categories, and never contradict a passing check with an opinion.
- **Placeholders.** `export {}`, empty barrels, components nothing mounts yet, helpers with no callers. Deliberate scaffolding is a decision, not an oversight — and a workspace listed in `ignoreWorkspaces` in `knip.config.ts` is being scaffolded on purpose.
- **Unused code that does not ship.** Dead weight is not harm. Code gets recycled, or replaced by a library once one exists; deleting it on sight destroys that option. Raise it only when it reaches a production bundle.
- **Hypothetical scale.** "This assertion becomes degenerate once a second X exists" is not a defect while there is one X.
- **Anything already tracked in an issue.** Reference the issue once in the context line instead.
- **Naming, wording and i18n**, unless asked for.

## Gate failures go nowhere

A finding that fails the gate is dropped. Do not soften it, do not demote it into Nits, and do not open an issue for it. A tracker filling with agent-generated cleanup tickets is worse than a padded review, because issues persist and nobody closes them.

State a bare count in chat, never in the comment — "seven items failed the gate" — with no titles and no argument. A count that climbs from one round to the next is the signal that the magnification has gone too far; say so plainly and stop.

Append to a cleanup issue only when one already exists, and never create it. Find it from the PR rather than from memory: the issue is registered as blocked by the PR, and the review's context line names it. If neither points at one, there is no cleanup issue and the finding is simply dropped.

## Consistency findings

One narrow class survives without naming a runtime failure, because its cost lands on developers and agents rather than on users. A candidate qualifies only if one of these holds, and both are countable rather than arguable:

- **An established norm is broken** — two or more sibling packages already do it the other way.
- **A declaration contradicts reality** — a config, manifest or document asserts something the repo does not do. An Nx input naming a dependency the package does not declare; a structure list naming two apps where there are six.

Preference with neither property is still dropped, however tidy the change would be.

These never enter a review comment. They belong in a cleanup issue when one already exists, and they are capped like nits.

## Severity

Severity follows the consequence, never how interesting the defect is.

- **Blocking** — a user doing an ordinary thing loses money, data or access. Merging is the wrong call.
- **Should fix** — a named, reachable failure with bounded impact.
- **Nits** — real but cosmetic. **Three per review, maximum.** Needing more means the magnification went too far; keep the best three and drop the rest.

Security findings are not automatically blocking. Weigh who can exploit it and what they gain. An input the attacker already controls end to end rarely justifies one.

A Blocking item, whole:

```markdown
- [ ] **Partial payments never refresh.** `apps/checkout/src/routes/i/$invoiceId.tsx:66` invalidates only on a status change, but the backend publishes on partial payment without one, so the amount owed stays stale while the buyer is looking at it. Fix: invalidate on every message.
  - [ ] Not a real problem
```

## Rounds

Establish which round you are in before reviewing. The comment records it, so a fresh session derives it from the artifact rather than from memory: no review comment on the PR means round 1; otherwise read the round and commit from its context line, and increment only if `HEAD` has moved since. Re-reading the same commit is the same round.

Raise the bar every round.

- **Round 1** — full review.
- **Round 2** — verify round 1. Add new findings only at Blocking or Should fix.
- **Round 3 and later** — verify only. A new finding may be added only if it is Blocking. Everything else is dropped permanently: anything that survived two rounds of reading unnoticed is not urgent, and will resurface with real evidence if it ever matters.

Count dismissals as you go. Once the author has rejected more than a third of what you raised, drop to Blocking-only for the rest of the review whatever the round.

## Dismissals are rules

Every item carries a second checkbox the author ticks to reject it, so dismissing costs them one click instead of a rebuttal. Read the previous comment before re-reviewing:

- An item ticked **Not a real problem** is closed permanently. Never raise it again.
- Generalise it to its class and apply that too — a dismissed unmounted component puts unmounted components out of scope, a dismissed stub does the same for stubs.
- Append the class below when it recurs.

Dismissed classes so far: unmounted or uncalled scaffolding in an app still being built; length limits on error text shown to users.

## Format

See [FORMAT.md](FORMAT.md), which also carries the linter every draft must pass before it is published.
