#!/usr/bin/env node
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { createInterface } from "node:readline"

import { instance } from "@viz-js/viz"
import type { IConfiguration } from "dependency-cruiser"

const [outputPath] = process.argv.slice(2)

if (!outputPath) throw new Error("Usage: generate-graphviz.ts <output.svg> < input.dot")

// Matches: optional indent + "source" -> "dest" + optional [attrs]
const EDGE_REGEX = /^(\s*)"([^"]+)"\s*->\s*"([^"]+)"(\s*\[([^\]]*)\])?\s*$/

//* A node definition is `"id" [ ...attrs... ]`. Cluster declarations use `{` (not `[`), and
//* the regex is unanchored, so on a clustered line it still picks out the inner node.
const NODE_REGEX = /"([^"]+)"\s*(\[[^\]]*\])/

//* dependency-cruiser types a theme entry's `criteria` and `attributes` as `any`; these are the
//* only fields this script reads off them.
type ModuleThemeEntry = {
  criteria?: { source?: string }
  attributes?: { fillcolor?: string }
}

const configPath = resolve(process.cwd(), ".dependency-cruiser.ts")
const { default: config } = (await import(configPath)) as { default: IConfiguration }

const modules: ModuleThemeEntry[] = config?.options?.reporterOptions?.dot?.theme?.modules ?? []

const compiledRules = modules.flatMap(({ criteria, attributes }) =>
  criteria?.source && attributes?.fillcolor
    ? [{ pattern: new RegExp(criteria.source), color: attributes.fillcolor }]
    : [],
)

function getEdgeColor(source: string): string | null {
  for (const { pattern, color } of compiledRules) {
    if (pattern.test(source)) return color
  }

  return null
}

//* App source, workspace packages and virtual modules are kept as-is; everything else is an
//* external npm package (pnpm store paths and bare specifiers, scoped or not).
function isExternalPackage(id: string): boolean {
  return !(
    id.startsWith("src/") ||
    id.startsWith("@bitcart/") ||
    id.startsWith("virtual:") ||
    /^[^/]+\.[cm]?[jt]sx?$/.test(id)
  )
}

//* Derive the bare package name from a pnpm virtual-store key — the segment before the
//* package's own version, with the scope separator decoded (`+` -> `/`). Examples:
//* `@base-ui+react@1.5.0_react@19.2.7` -> `@base-ui/react`, `lucide-react@1.17.0_...` -> `lucide-react`.
function cleanPnpmName(storeKey: string): string {
  const match = storeKey.match(/^(@?[^@]+)@/)
  const name = match ? match[1] : storeKey

  return name.replaceAll("+", "/")
}

//* Canonical package name for any external module id — from the pnpm store key, a scoped
//* `@scope/name`, or the first segment of a bare specifier.
function packageName(id: string): string {
  const stored = id.match(/^node_modules\/\.pnpm\/(.+)$/)

  if (stored) {
    return cleanPnpmName(stored[1])
  } else {
    const bare = id.replace(/^node_modules\//, "")
    const scoped = bare.match(/^@[^/]+\/[^/]+/)

    return scoped ? scoped[0] : bare.split("/")[0]
  }
}

//* Collapse external packages to one flat node under `node_modules`, so all npm dependencies
//* sit in a single scope (no `.pnpm`, no per-subpath sprawl). Duplicate representations of the
//* same package converge on the same id and merge.
function mapId(id: string): string {
  if (isExternalPackage(id)) {
    return `node_modules/${packageName(id)}`
  } else return id
}

const escapeHtml = (text: string) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")

//! The WASM Graphviz has no text-layout plugin, so it sizes text from built-in metrics, which
//! cover Helvetica but not "Helvetica-bold". Bold cluster labels come from `<B>` instead, which
//! the metrics do cover.
const boldClusterLabels = (line: string) =>
  line.replaceAll(
    /\{label="([^"]*)"/g,
    (_match, label: string) => `{label=<<B>${escapeHtml(label)}</B>>`,
  )

const seenNodes = new Set<string>()
const seenEdges = new Set<string>()
const dot: string[] = []
const lines = createInterface({ input: process.stdin })

for await (const line of lines) {
  const edge = EDGE_REGEX.exec(line)

  if (edge) {
    const [, indent, source, dest, , existingAttrs] = edge
    const from = mapId(source)
    const to = mapId(dest)
    const key = `${from} ${to}`

    if (from !== to && !seenEdges.has(key)) {
      seenEdges.add(key)

      const color = getEdgeColor(source)
      // Put layer color first so violation colors (from existing attrs) take precedence
      const attrs = [color && `color="${color}"`, existingAttrs].filter(Boolean).join(" ")

      dot.push(`${indent}"${from}" -> "${to}"${attrs ? ` [${attrs}]` : ""}`)
    }

    continue
  }

  const node = NODE_REGEX.exec(line)

  if (node && isExternalPackage(node[1])) {
    const id = mapId(node[1])

    if (!seenNodes.has(id)) {
      seenNodes.add(id)

      const name = packageName(node[1])

      const attrs = node[2]
        .replace(/label=<[^>]*>/, `label=<${name}>`)
        .replace(/URL="[^"]*"/, `URL="https://www.npmjs.com/package/${name}"`)

      const indent = line.match(/^\s*/)?.[0] ?? ""

      dot.push(
        boldClusterLabels(
          `${indent}subgraph "cluster_node_modules" {label="node_modules" "${id}" ${attrs} }`,
        ),
      )
    }

    continue
  }

  dot.push(boldClusterLabels(line))
}

const result = (await instance()).render(dot.join("\n"), { format: "svg" })

for (const { level = "error", message } of result.errors) {
  console.error(`graphviz ${level}: ${message.trim()}`)
}

if (result.status === "success") {
  writeFileSync(outputPath, result.output)
} else process.exitCode = 1
