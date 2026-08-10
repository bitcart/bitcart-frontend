import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import type { PageCatalog } from "@bitcart/qa"
import { createPageRegistry } from "@bitcart/qa/e2e"
import { values } from "remeda"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const E2E_DIRNAME = __dirname

export const PAGE_REGISTRY = createPageRegistry({
  pagesSrcDir: resolve(__dirname, "../src/pages"),
  pageFileName: "+Page.tsx",
})

export const PAGE_CATALOG: PageCatalog = values(PAGE_REGISTRY)
