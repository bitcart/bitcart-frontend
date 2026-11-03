#!/usr/bin/env node
import { createHash } from "node:crypto"
import { readFile, readdir } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import { setTimeout } from "node:timers/promises"
import { parseArgs } from "node:util"

const API_URL = "https://api.netlify.com/api/v1"
const SYNC_FILE_LIMIT = 100
const CONCURRENT_UPLOADS = 5
const MAX_UPLOAD_RETRIES = 5
const DEPLOY_TIMEOUT_MS = 20 * 60_000

const DIFFED_STATES = new Set(["prepared", "uploading", "uploaded", "ready"])
const READY_STATES = new Set(["ready"])
const RULE_KINDS = ["redirect", "header"] as const
const PROCESSED_RULES_PATTERN = /^(\d+|No) (redirect|header) rules? processed$/

type RuleKind = (typeof RULE_KINDS)[number]

type Deploy = {
  id: string
  state: string
  required?: string[]
  error_message?: string
  ssl_url: string
  deploy_ssl_url: string
  summary?: { messages?: { title: string }[] }
}

type DeployFile = {
  path: string
  body: Buffer
}

class NetlifyApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const { values: options, positionals } = parseArgs({
  allowPositionals: true,

  options: {
    draft: { type: "boolean", default: false },
    message: { type: "string" },
  },
})

const [siteName, publishDir, configPath] = positionals
const token = process.env.NETLIFY_AUTH_TOKEN

if (!siteName || !publishDir || !configPath || !token) {
  throw new Error(
    "Usage: NETLIFY_AUTH_TOKEN=<token> deploy-netlify.ts <site-name> <publish-dir> <netlify.toml> [--draft] [--message <text>]",
  )
}

type NetlifyRequest = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>
}

async function netlify<T>(path: string, init: NetlifyRequest = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  })

  if (response.ok) {
    return (await response.json()) as T
  } else {
    throw new NetlifyApiError(
      response.status,
      `${init.method ?? "GET"} ${path} failed with ${response.status}: ${await response.text()}`,
    )
  }
}

//* Mirrors Netlify CLI: dotfiles are never published, apart from `.well-known`.
const isPublished = (path: string) =>
  path.split("/").every((segment) => !segment.startsWith(".") || segment === ".well-known")

async function collectFiles(config: Buffer): Promise<DeployFile[]> {
  const entries = await readdir(publishDir, { recursive: true, withFileTypes: true })

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name))
      .map((absolutePath) => ({
        absolutePath,
        path: relative(publishDir, absolutePath).split(sep).join("/"),
      }))
      .filter(({ path }) => isPublished(path))
      .map(async ({ absolutePath, path }) => ({ path, body: await readFile(absolutePath) })),
  )

  //! Netlify reads the redirects and headers of a CLI or API deploy from an uploaded `netlify.toml`.
  return [...files, { path: "netlify.toml", body: config }]
}

const sha1 = (body: Buffer) => createHash("sha1").update(body).digest("hex")

async function waitForState(deployId: string, states: ReadonlySet<string>): Promise<Deploy> {
  const deadline = Date.now() + DEPLOY_TIMEOUT_MS

  while (Date.now() < deadline) {
    const deploy = await netlify<Deploy>(`/sites/${siteId}/deploys/${deployId}`)

    if (deploy.state === "error") {
      throw new Error(deploy.error_message ?? `Deploy ${deployId} failed`)
    } else if (states.has(deploy.state)) return deploy

    await setTimeout(1000)
  }

  throw new Error(`Timed out waiting for deploy ${deployId}`)
}

async function uploadFile(deployId: string, { path, body }: DeployFile): Promise<void> {
  for (let retry = 0; ; retry++) {
    try {
      await netlify(`/deploys/${deployId}/files/${encodeURI(path)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body,
      })

      return void null
    } catch (error) {
      const isRetryable =
        !(error instanceof NetlifyApiError) || (error.status > 400 && error.status !== 422)

      if (!isRetryable || retry === MAX_UPLOAD_RETRIES) throw error

      await setTimeout(Math.min(5000 * 2 ** retry, 90_000))
    }
  }
}

async function uploadFiles(deployId: string, files: DeployFile[]): Promise<void> {
  const queue = [...files]

  await Promise.all(
    Array.from({ length: CONCURRENT_UPLOADS }, async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        await uploadFile(deployId, file)
      }
    }),
  )
}

const countConfiguredRules = (config: string, kind: RuleKind) =>
  config.match(new RegExp(String.raw`^\[\[${kind}s\]\]\s*$`, "gm"))?.length ?? 0

//! Netlify reports processed rules only as human-readable summary titles, such as
//! "1 redirect rule processed" or "No header rules processed".
function countProcessedRules(deploy: Deploy, kind: RuleKind): number {
  for (const { title } of deploy.summary?.messages ?? []) {
    const match = PROCESSED_RULES_PATTERN.exec(title)

    if (match?.[2] === kind) return match[1] === "No" ? 0 : Number(match[1])
  }

  return 0
}

async function expectStatus(url: string, status: number): Promise<void> {
  const response = await fetch(url, { method: "HEAD", redirect: "manual" })

  if (response.status !== status) {
    throw new Error(`Expected ${status} from ${url}, got ${response.status}`)
  }
}

async function verifyDraft(deploy: Deploy, config: string): Promise<void> {
  for (const kind of RULE_KINDS) {
    const configured = countConfiguredRules(config, kind)
    const processed = countProcessedRules(deploy, kind)

    if (processed !== configured) {
      throw new Error(
        `Netlify processed ${processed} of the ${configured} ${kind} rules in ${configPath}`,
      )
    }
  }

  await expectStatus(`${deploy.deploy_ssl_url}/`, 200)
  await expectStatus(`${deploy.deploy_ssl_url}/__deploy-check-${deploy.id}`, 404)
}

const { id: siteId } = await netlify<{ id: string }>(`/sites/${siteName}.netlify.app`)
const config = await readFile(configPath)
const files = await collectFiles(config)
const digests = Object.fromEntries(files.map(({ path, body }) => [path, sha1(body)]))
const isAsync = files.length > SYNC_FILE_LIMIT
const title = options.message ? `?title=${encodeURIComponent(options.message)}` : ""

const created = await netlify<Deploy>(`/sites/${siteId}/deploys${title}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ files: digests, draft: true, async: isAsync }),
})

const diffed = isAsync ? await waitForState(created.id, DIFFED_STATES) : created
const required = new Set(diffed.required ?? [])
const uploads = files.filter(({ path }) => required.has(digests[path]))

console.info(`Uploading ${uploads.length} of ${files.length} files to deploy ${created.id}`)

await uploadFiles(created.id, uploads)

const draft = await waitForState(created.id, READY_STATES)

await verifyDraft(draft, config.toString())

console.info(`Draft checks passed on ${draft.deploy_ssl_url}`)

if (!options.draft) {
  const published = await netlify<Deploy>(`/sites/${siteId}/deploys/${draft.id}/restore`, {
    method: "POST",
  })

  console.info(`Published deploy ${published.id} to ${published.ssl_url}`)
}
