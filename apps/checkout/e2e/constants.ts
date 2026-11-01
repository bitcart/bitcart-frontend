import { readdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import type { PageCatalog, PageRegistry } from "@bitcart/qa"
import { indexBy, prop, values } from "remeda"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const E2E_DIRNAME = __dirname

export const TEMPLATE_IDS = readdirSync(resolve(__dirname, "../src/templates"), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

export const PAGE_REGISTRY: PageRegistry = indexBy(
  TEMPLATE_IDS.map((templateId) => ({
    path: `/preview/${templateId}`,
    name: `${templateId}-template-preview`,
  })),
  prop("path"),
)

export const PAGE_CATALOG: PageCatalog = values(PAGE_REGISTRY)

export const DEFAULT_TEST_ROUTE = `/preview/${TEMPLATE_IDS[0]}` as const
