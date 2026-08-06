#!/usr/bin/env node
import { resolve } from "node:path"
import { createInterface } from "node:readline"

// Matches: optional indent + "source" -> "dest" + optional [attrs]
const EDGE_REGEX = /^(\s*)"([^"]+)"\s*->\s*"([^"]+)"(\s*\[([^\]]*)\])?\s*$/

//* A node definition is `"id" [ ...attrs... ]`. Cluster declarations use `{` (not `[`), and
//* the regex is unanchored, so on a clustered line it still picks out the inner node.
const NODE_REGEX = /"([^"]+)"\s*(\[[^\]]*\])/

const configPath = resolve(process.cwd(), ".dependency-cruiser.js")
const { default: config } = await import(configPath)

const modules = config?.options?.reporterOptions?.dot?.theme?.modules ?? []

const compiledRules = modules
  .filter(({ criteria, attributes }) => criteria?.source && attributes?.fillcolor)
  .map(({ criteria, attributes }) => ({
    pattern: new RegExp(criteria.source),
    color: attributes.fillcolor,
  }))

function getEdgeColor(source) {
  for (const { pattern, color } of compiledRules) {
    if (pattern.test(source)) return color
  }

  return null
}

//* App source, workspace packages and virtual modules are kept as-is; everything else is an
//* external npm package (pnpm store paths and bare specifiers, scoped or not).
function isExternalPackage(id) {
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
function cleanPnpmName(storeKey) {
  const match = storeKey.match(/^(@?[^@]+)@/)
  const name = match ? match[1] : storeKey

  return name.replaceAll("+", "/")
}

//* Canonical package name for any external module id — from the pnpm store key, a scoped
//* `@scope/name`, or the first segment of a bare specifier.
function packageName(id) {
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
function mapId(id) {
  if (isExternalPackage(id)) {
    return `node_modules/${packageName(id)}`
  } else return id
}

//* dependency-cruiser tints collapsed nodes with an 8-digit (alpha) `fillcolor`, but
//* graphviz 2.43 drops the alpha and renders it opaque — so the red label sits on a solid
//* red box and disappears. Composite the color over white to recover the intended tint.
function flattenAlphaOverWhite(hex8) {
  const channel = (offset) => parseInt(hex8.slice(offset, offset + 2), 16)
  const alpha = channel(7) / 255

  const over = (value) =>
    Math.round(value * alpha + 255 * (1 - alpha))
      .toString(16)
      .padStart(2, "0")

  return `#${over(channel(1))}${over(channel(3))}${over(channel(5))}`
}

const seenNodes = new Set()
const seenEdges = new Set()
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

      process.stdout.write(`${indent}"${from}" -> "${to}"${attrs ? ` [${attrs}]` : ""}\n`)
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
        .replace(
          /fillcolor="(#[0-9a-fA-F]{8})"/,
          (_m, hex) => `fillcolor="${flattenAlphaOverWhite(hex)}"`,
        )

      const indent = line.match(/^\s*/)[0]

      process.stdout.write(
        `${indent}subgraph "cluster_node_modules" {label="node_modules" "${id}" ${attrs} }\n`,
      )
    }

    continue
  }

  process.stdout.write(line + "\n")
}
