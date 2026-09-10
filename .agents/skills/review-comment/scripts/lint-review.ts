#!/usr/bin/env node
//* Checks a drafted review comment or cleanup issue against the structural rules in ../SKILL.md.
//* Judgement rules — the gate, severity, whether an item argues against itself — are not checkable
//* here and stay the reviewer's job.
//* Usage: node lint-review.ts [--issue] <draft.md>

import { readFileSync } from "node:fs"

const REVIEW_SECTIONS = ["## Blocking", "## Should fix", "## Nits"] as const
const ISSUE_SECTIONS = ["## Parent", "## Tasks", "## Blocked by"] as const

const SEVERITY_LABEL = /\((?:high|low|minor|major|critical|blocking|nit)\)/i
const FILE_REF = /`[^`]*\.[a-z]{2,5}(?::\d+(?:-\d+)?)?[^`]*`/
const ITEM = /^- \[[ x]\] /
const BOLD_LEAD = /^- \[[ x]\] \*\*.+\*\*/
const DISMISSAL = /^- \[[ x]\] Not a real problem$/
const ROUND = /^Round \d+\b/
const NIT_CAP = 3

const args = process.argv.slice(2)
const isIssue = args.includes("--issue")
const path = args.find((arg) => !arg.startsWith("--"))

if (!path) {
  console.error("usage: lint-review.ts [--issue] <draft.md>")
  process.exit(2)
}

const sections: readonly string[] = isIssue ? ISSUE_SECTIONS : REVIEW_SECTIONS
const lines = readFileSync(path, "utf8").split("\n")
const errors: string[] = []

const at = (index: number, message: string) => errors.push(`${path}:${index + 1}  ${message}`)

let section: string | null = null
let nits = 0
let items = 0

lines.forEach((line, index) => {
  if (line.startsWith("#")) {
    if (line.startsWith("###")) {
      at(index, "per-finding heading; the checkbox is the affordance")
    } else if (line.startsWith("## ") && !sections.includes(line.trim())) {
      at(index, `invented section ${JSON.stringify(line.trim())}; allowed: ${sections.join(", ")}`)
    }

    section = line.trim()

    return
  }

  if (/^---\s*$/.test(line) && index > 0) at(index, "horizontal rule")

  if (SEVERITY_LABEL.test(line)) at(index, "severity label; the section already carries it")

  if (!ITEM.test(line) || DISMISSAL.test(line.trim())) return

  items += 1
  if (section === "## Nits") nits += 1

  if (!BOLD_LEAD.test(line)) at(index, "item does not open with a bold statement")
  if (!FILE_REF.test(line)) at(index, "item cites no `path:line`")
  if (!line.includes("Fix:")) at(index, "item proposes no fix")

  if (!isIssue && !DISMISSAL.test((lines[index + 1] ?? "").trim())) {
    at(index, "item has no nested `Not a real problem` checkbox")
  }
})

if (nits > NIT_CAP)
  errors.push(`${path}  ${nits} nits, cap is ${NIT_CAP}: keep the best ${NIT_CAP}`)

if (!isIssue) {
  const first = lines.find((line) => line.trim().length > 0) ?? ""

  if (first.startsWith("#")) errors.push(`${path}:1  no context line before the first heading`)
  else if (!ROUND.test(first)) errors.push(`${path}:1  context line records no round`)
}

if (errors.length > 0) {
  console.error(errors.join("\n"))
  console.error(`\n${errors.length} problem(s) across ${items} item(s)`)
  process.exit(1)
}

console.log(`ok — ${items} item(s), ${nits} nit(s)`)
