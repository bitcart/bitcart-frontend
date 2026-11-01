---
name: prod-compare
description: Screenshots production (bitcart.ai, directory.bitcart.ai, testnet checkout) beside the local preview builds in light and dark mode, measures how far each pair differs and publishes a side-by-side report. Use when asked to compare local against production, check a branch for visual regressions, or produce a before/after report of the apps.
---

# Compare production with the local previews

Each **pair** is one production screenshot beside its local twin: same page or interactive state, mode
and viewport. [scripts/targets.ts](scripts/targets.ts) lists everything paired, and is the file to edit
when pages, states or checkout steps change. Run the scripts from the repo root; each one's header
documents its flags.

## 1. Check the previews

The local side is the user's `just preview` on ports 3000 (landing), 3001 (directory) and 3002
(checkout). Confirm each port answers with `curl -s -o /dev/null -w '%{http_code}' localhost:<port>`
(checkout answers 404 at `/`, which still means up). If any is down, ask the user to start `just preview`:
starting or rebuilding apps yourself would replace the `dist` a running preview serves.

Write all output to a fresh folder in your scratchpad.

## 2. Capture landing and directory

```bash
node .agents/skills/prod-compare/scripts/capture.ts apps --out <dir>
```

This takes several minutes, so run it in the background. `--mode light` or `--mode dark` limits the run to
one mode, and `--only pages` or `--only states` to one half. Done when the log has no `FAIL` line, or every
`FAIL` is explained: a selector in `targets.ts` that no longer matches gets fixed and re-run, and a page
that exists on only one side gets reported.

## 3. Capture checkout

Checkout needs testnet invoice ids from the user: production and local open the same invoice, since both
talk to the testnet backend. The email steps need an invoice still asking for an email; the payment steps
need one past it.

```bash
node .agents/skills/prod-compare/scripts/capture.ts checkout --out <dir> --invoice <id> --phase email
node .agents/skills/prod-compare/scripts/capture.ts checkout --out <dir> --invoice <id> --phase payment
```

Both phases abort every request except GET, HEAD and OPTIONS, and the log lists each one blocked.
Moving an invoice past the email step is a real write to testnet: run `capture.ts submit-email --invoice
<id> --email <address>` only after the user approves submitting an email to that exact invoice.

## 4. Compose the pairs

```bash
node .agents/skills/prod-compare/scripts/compose.ts report --out <dir>
```

It writes `<dir>/report/` (an `index.html`, an `img/` folder of side-by-side WebP images and a
`files.json` for publishing) and prints every pair sorted by **visible** difference: the share of pixels
whose luminance moved by more than 24 of 255 levels. **Shade** counts moves past 4, so a palette change
shows up as near-100% shade with low visible difference. Only a pair marked **identical** has no changed
pixel: 0% on both measures can still hide a faint tint. When page heights differ, both measures cover
only the shared height, so a taller section can inflate the numbers for everything below it.

## 5. Write the findings

Look at every composite in `<dir>/report/img/`, in both modes. Done when you can attribute every
visible difference to one of three causes:

- **Deliberate**: a change in the branch's diff, such as a new token or a restyled component.
- **Regression**: something the branch broke, such as lost contrast, a missing hover state or shifted
  layout. Report it to the user with the pair's image.
- **Data**: content that differs between the two backends. The local builds read the testnet API and
  production reads mainnet, so counts, lists and rates differ: `/coins` shows fewer tokens locally
  because testnet fails to return some chains' token lists.

Two helpers sharpen the look:

- `capture.ts colors [--invoice <id>]` prints every theme token's hex value on both sides, flagging the
  ones that changed. Quote these rather than colors sampled from the images.
- `compose.ts zoom --out <dir> --pair <mode>/<group>/<name>-<viewport> --region <x>,<y>,<width>,<height>`
  crops the same region from both full-size shots into `<dir>/zoom/`, for details like badges and focus
  rings that the composites shrink. Page composites run up to 16,000px tall, too tall to read whole:
  read long pages in slices instead (`--region 0,0,390,900 --scale 1`, then `0,900,390,900`, and so on).

A state that looks wrong on one side only (a popover caught closed, a hover missed) is a capture miss
until a re-take with `capture.ts apps --out <dir> --only states` shows it again.

Then replace the placeholder between the `FINDINGS:START` and `FINDINGS:END` markers in `index.html`
with one `.verdict` block per mode, app or gap. Give each block a `chip ok`, `chip warn` or `chip call`
label, a bold one-line verdict and a paragraph of specifics: hex values, visible percentages, page names.
End with a gaps block naming what wasn't captured (and why), plus the invoice ids used. Re-running
`compose.ts report` keeps whatever sits between the markers.

## 6. Publish

Publish `<dir>/report/index.html` with the Artifact tool, with `root` set to `<dir>/report` and `files`
set to the contents of `files.json`, so each image ships beside the page. To update the same report
later, publish from the same path again.
