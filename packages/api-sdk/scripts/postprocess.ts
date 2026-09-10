//* Repairs what Orval's output loses or gets wrong, once the generator has written it.
//*
//! Must be run from the `generate:api` target, not from Orval's `afterAllFilesWrite` hook:
//! Orval reports a failed hook and still exits 0, which would let a stale rewrite pass the build.
//! The rewritten source must be reformatted by `oxfmt` in a following call.

import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { ENUM_FALLBACK, SCHEMA_ENUM_OVERRIDES } from "./constants"
import type { OpenApiSpec } from "./types"

type Flow = () => { pending: Map<string, string>; succeeded: boolean }

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const SPEC_PATH = join(PACKAGE_ROOT, "openapi.json")
const SCHEMAS_ROOT = join(PACKAGE_ROOT, "src/schemas/generated")
const ENDPOINTS_ROOT = join(PACKAGE_ROOT, "src/endpoints/_internal/generated")

const walk = (directory: string, extension: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) return walk(path, extension)
    else return entry.name.endsWith(extension) ? [path] : []
  })

const report = (flow: string, failures: string[], summary: string): boolean => {
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`${flow}: ${failure}`)
    }

    console.error(`${flow}: Orval's output shape changed; update the rewrites to match.`)

    return false
  } else {
    console.log(`${flow}: ${summary}`)

    return true
  }
}

//* Repairs Orval's generated Zod schemas.
//*
//* 1. Object-valued defaults. `.default()` hands the value straight to the caller without parsing
//*    it, which drops every nested default the parent's default object omits. `.prefault()` takes
//*    the input type and re-parses, matching what an OpenAPI `default` means.
//* 2. `additionalProperties: true`. Orval emits a plain `zod.object`, which strips the undeclared
//*    keys the API extends such payloads with at runtime. `zod.looseObject` preserves them.
//* 3. Enums overridden by `transform-spec.ts`. A closed list makes every value outside it a parse
//*    failure, and `runtimeValidation` propagates that failure to each page rendering the payload.
//*    `.catch()` resolves such a value to the fallback member.
//*
//! All three rewrites are regexes over Orval's output shape, which an upgrade can reshape silently.
//! Each one asserts that it matched something; the flow fails otherwise.
const postprocessSchemas: Flow = () => {
  const OBJECT_CONST = /^export const (\w+) = \{/gm

  //* An enum declaration that has no fallback yet, however oxfmt wrapped the member list.
  const ENUM_DECLARATION = /zod\.enum\(\[[^\]]*\]\)(?!\.catch\()/g

  const spec = JSON.parse(readFileSync(SPEC_PATH, "utf8")) as OpenApiSpec

  const looseSchemas = new Set(
    Object.entries(spec.components?.schemas ?? {})
      .filter(([, schema]) => schema.additionalProperties === true)
      .map(([name]) => name),
  )

  const fallbackEnums = Object.values(SCHEMA_ENUM_OVERRIDES).flatMap((properties) =>
    Object.values(properties).filter((members) => members.includes(ENUM_FALLBACK)),
  )

  const applyPrefault = (source: string) => {
    let updated = source
    let rewrites = 0

    for (const [, name] of source.matchAll(OBJECT_CONST)) {
      const callSite = `.default(${name})`

      if (!updated.includes(callSite)) continue

      updated = updated.replaceAll(callSite, `.prefault(${name})`)
      rewrites += 1
    }

    return { rewrites, source: updated }
  }

  const applyLooseObjects = (source: string) => {
    let updated = source
    let rewrites = 0

    for (const name of looseSchemas) {
      const declaration = new RegExp(`^export const ${name} = zod\\.object\\(`, "m")

      if (!declaration.test(updated)) continue

      updated = updated.replace(declaration, `export const ${name} = zod.looseObject(`)
      rewrites += 1
    }

    return { rewrites, source: updated }
  }

  const applyEnumFallback = (source: string) => {
    let rewrites = 0

    const updated = source.replace(ENUM_DECLARATION, (declaration) => {
      if (!declaration.includes(`"${ENUM_FALLBACK}"`)) return declaration

      rewrites += 1

      return `${declaration}.catch("${ENUM_FALLBACK}")`
    })

    return { rewrites, source: updated }
  }

  const failures: string[] = []
  const pending = new Map<string, string>()
  let prefaulted = 0
  let loosened = 0
  let caught = 0

  for (const file of walk(SCHEMAS_ROOT, ".zod.ts")) {
    const original = readFileSync(file, "utf8")
    const withPrefaults = applyPrefault(original)
    const withLooseObjects = applyLooseObjects(withPrefaults.source)
    const withEnumFallbacks = applyEnumFallback(withLooseObjects.source)

    prefaulted += withPrefaults.rewrites
    loosened += withLooseObjects.rewrites
    caught += withEnumFallbacks.rewrites

    if (withEnumFallbacks.source !== original) {
      pending.set(file, withEnumFallbacks.source)
    }
  }

  if (prefaulted === 0) {
    failures.push("no object-valued `.default(...)` call site was found")
  }

  if (looseSchemas.size > 0 && loosened === 0) {
    failures.push(
      `none of the ${looseSchemas.size} \`additionalProperties: true\` schemas was declared as \`zod.object(\``,
    )
  }

  if (fallbackEnums.length > 0 && caught === 0) {
    failures.push(
      `none of the ${fallbackEnums.length} enum(s) carrying \`${ENUM_FALLBACK}\` was declared as \`zod.enum([\``,
    )
  }

  return {
    pending,

    succeeded: report(
      "schemas",
      failures,
      `${prefaulted} prefault(s), ${loosened} loose object(s), ${caught} enum fallback(s)`,
    ),
  }
}

//* Replaces the failure branch Orval emits in every generated operation with `createApiFailure`.
//*
//* Orval's own branch throws a message-less `Error` and runs `JSON.parse` over the response body
//* unconditionally, unlike the success branch next to it, which parses only a JSON content type.
//* A plain-text 500 or a proxy's HTML 502 therefore threw a `SyntaxError` before `status` was
//* assigned, and every classifier in `src/utils.ts` read that `SyntaxError` as a foreign error.
//*
//! The rewrite is a regex over Orval's output shape, which an upgrade can reshape silently.
//! Every matched block is checked statement by statement, and the flow fails as soon as one block
//! or one file fails to match.
const postprocessEndpoints: Flow = () => {
  const FAILURE_IMPORT = 'import { createApiFailure } from "../utils"'

  //* The whole `if (!res.ok) { ... throw err }` branch, however oxfmt wrapped the `err` annotation.
  const FAILURE_BLOCK = /^ {2}if \(!res\.ok\) \{\n(?: {4,}.*\n)*? {4}throw err\n {2}\}$/gm

  //* What that branch must be made of for the replacement to mean the same thing.
  const FAILURE_STATEMENTS = [
    "new globalThis.Error()",
    "const data",
    "body ? JSON.parse(body) : {}",
    "err.info = data",
    "err.status = res.status",
  ]

  //* A single-line import, or the closing line of a multi-line one.
  const IMPORT_END = /^(?:import .*"|} from ".*")$/gm

  const failures: string[] = []

  const applyFailureHelper = (source: string, file: string) => {
    let rewrites = 0

    const updated = source.replace(FAILURE_BLOCK, (block) => {
      //* oxfmt wraps the branch by the length of the response type names, which differs per
      //* operation. Matching runs against a single-spaced line to stay independent of that.
      const statements = block.replace(/\s+/g, " ")
      const missing = FAILURE_STATEMENTS.filter((statement) => !statements.includes(statement))

      if (missing.length > 0) {
        failures.push(`${file}: a failure branch is missing ${missing.join(", ")}`)

        return block
      }

      rewrites += 1

      return "  if (!res.ok) throw createApiFailure(res, body)"
    })

    return { rewrites, source: updated }
  }

  const addFailureImport = (source: string, file: string) => {
    const imports = [...source.matchAll(IMPORT_END)]
    const lastImport = imports[imports.length - 1]

    if (!lastImport) {
      failures.push(`${file}: no import to append the \`createApiFailure\` import to`)

      return source
    }

    const insertAt = lastImport.index + lastImport[0].length

    return `${source.slice(0, insertAt)}\n${FAILURE_IMPORT}${source.slice(insertAt)}`
  }

  const pending = new Map<string, string>()
  let rewritten = 0

  for (const file of walk(ENDPOINTS_ROOT, ".ts")) {
    const original = readFileSync(file, "utf8")
    const withHelper = applyFailureHelper(original, file)

    if (withHelper.rewrites === 0) {
      failures.push(`${file}: no \`if (!res.ok)\` branch was found`)

      continue
    }

    rewritten += withHelper.rewrites

    pending.set(file, addFailureImport(withHelper.source, file))
  }

  return { pending, succeeded: report("endpoints", failures, `${rewritten} failure branch(es)`) }
}

const flows = [postprocessSchemas, postprocessEndpoints].map((flow) => flow())

if (flows.every(({ succeeded }) => succeeded)) {
  for (const { pending } of flows) {
    for (const [file, source] of pending) {
      writeFileSync(file, source)
    }
  }
} else process.exit(1)
