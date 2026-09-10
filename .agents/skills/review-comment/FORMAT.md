# Comment format

## Worked example

```markdown
Round 3 — reviewed `7437c683`. `just check` passes. Items tracked in #270 are omitted.

## Blocking

- [ ] **Partial payments never refresh.** `apps/checkout/src/routes/i/$invoiceId.tsx:66` invalidates only on a status change, but the backend publishes on partial payment without one (`api/services/crud/invoices.py:527-544`), so the amount owed stays stale while the buyer is looking at it. Fix: invalidate on every message.
  - [ ] Not a real problem

## Should fix

- [ ] **`TData` is unchecked when no `select` is passed.** `packages/api-sdk/src/endpoints/_internal/utils.ts:15` returns `data as unknown as TData`, so `useInvoice<string>({ invoiceId })` compiles clean and types `data` as `string`. Fix: admit `TData` only when `select` is present.
  - [ ] Not a real problem

## Nits

- [ ] **`.gitattributes:12` cites a file that was renamed.** It refers to `scripts/transform-spec.js`; the file is `transform-spec.ts`. Fix: update the comment.
  - [ ] Not a real problem
```

## Structure

One context line, then `## Blocking`, `## Should fix`, `## Nits` in that order. Drop a heading with no items; never add a fourth. No opening summary, no closing verdict, no horizontal rules, no per-finding headings, no numbering — the checkbox is the affordance.

The context line states the round, what was reviewed, whether the repo's gates pass, and what has been deliberately left out. Nothing else. The round and the commit are what a later session reads to work out where it stands.

## Items

Each item is a checkbox with a nested **Not a real problem** checkbox, and reads: bold statement of what is wrong, where it lives as `path:line`, what breaks in terms someone would observe, then `Fix:` and the concrete change.

One defect per item. A finding with two independent fixes is two findings, because ticking the box should resolve the whole thing.

Prefer `path:line` over pasted code — the reference already says where to look, and a snippet goes stale the moment the author edits the file. Include one only when the defect is a property of the code's shape that prose cannot carry, and keep it to the lines that carry it.

Name the consequence, not the category. "Any invoice for a store with a post-payment redirect throws instead of loading" tells the author what they are protecting; "incorrect schema narrowing" does not.

Never label an item `(high)`, `(minor)` or `(blocking)`. The heading already said it.

## What never appears

- **History.** No "this used to be", "master did it this way", "reintroduced", "still". Describe the current state of the branch and nothing else.
- **The review process.** No "my earlier comment", "I withdraw", "as I recommended", "worth noting how this hid". The author does not need a finding's provenance to act on it.
- **Progress reports and praise.** No "substantial progress", no "genuinely fixed", no list of what got resolved. A fixed thing is absent from the list, and its absence is the report.

On a re-review, rewrite the comment from the current branch as though it were the first one, preserving any **Not a real problem** ticks the author has made. Resolved items disappear, surviving items stay, new items are added in place.

## Cleanup issues

An issue is a worklist too, so it uses the same item shape inside a thinner wrapper. There is no narrative section: anything needing a paragraph of justification to belong on the list does not belong on the list.

```markdown
## Parent

#260

One line naming the area and why it is a ticket.

## Tasks

- [ ] **Backoff resets too eagerly.** `ws.ts:42-44` resets the delay in `onopen`, so a server that accepts then immediately drops is reconnected once a second by every open tab. Fix: reset only once a connection has held for several seconds.

## Blocked by

- #266
```

Drop completed items when rewriting rather than leaving them ticked. The PR and the git history already record them, and a mostly-ticked list reads as nearly finished even when everything remaining is untouched.

Re-check each surviving item against the code before republishing. An item written against an earlier commit can become false rather than merely stale, and acting on a false item deletes working code.

## Checking a draft

Before publishing, run the linter over the file. It enforces the mechanical rules — hedges, the nit cap, section vocabulary, item shape, the dismissal checkbox — so they do not depend on remembering them:

```bash
node .agents/skills/review-comment/scripts/lint-review.ts draft.md
node .agents/skills/review-comment/scripts/lint-review.ts --issue draft.md
```

A non-zero exit means the draft is not ready. Fix the draft; never relax the linter.

## Publishing

A cleanup issue is attached to its PR by a Forgejo issue dependency, so a later session finds it with "What this blocks" action rather than by reading prose. The `forgejo-api` skill covers the request shape.

Post via the Forgejo API — see the `forgejo-api` skill. Amend the existing review comment in place rather than posting a successor, so the PR carries one current worklist instead of a thread to reconcile.
