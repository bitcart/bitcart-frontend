#!/usr/bin/env node
import { resolve } from "node:path"
import { createInterface } from "node:readline"

// Matches: optional indent + "source" -> "dest" + optional [attrs]
const EDGE_REGEXP = /^(\s*)"([^"]+)"\s*->\s*"([^"]+)"(\s*\[([^\]]*)\])?\s*$/

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

const lines = createInterface({ input: process.stdin })

for await (const line of lines) {
  const match = EDGE_REGEXP.exec(line)

  if (!match) {
    process.stdout.write(line + "\n")
    continue
  }

  const [, indent, source, dest, , existingAttrs] = match
  const color = getEdgeColor(source)

  if (!color) {
    process.stdout.write(line + "\n")
    continue
  }

  // Put layer color first so violation colors (from existing attrs) take precedence
  const attrs = existingAttrs ? `color="${color}" ${existingAttrs}` : `color="${color}"`

  process.stdout.write(`${indent}"${source}" -> "${dest}" [${attrs}]\n`)
}
