import { fileURLToPath } from "node:url"

import type { PageCatalog } from "@bitcart/qa"

import { getSitePages, readPostFiles } from "../src/common/content/files.ts"

export const E2E_DIRNAME = fileURLToPath(new URL(".", import.meta.url))

export const OUTPUT_DIR = fileURLToPath(new URL("../.output/public", import.meta.url))

export const SITE_PAGES = getSitePages(
  readPostFiles(fileURLToPath(new URL("../content/posts", import.meta.url))),
)

export const PAGE_CATALOG: PageCatalog = SITE_PAGES.map(({ path }) => ({ path, name: path }))

export const SAMPLE_POST = {
  path: "/bitcartcc-version-0610-is-out",
  title: "BitcartCC Version 0.6.1.0 is out!",
  coverFileName: "cover.png",

  //* Appears only in the post's body, not in its title or description.
  bodyOnlyTerm: "libseccomp2",
}

export const EMPTY_CATEGORY_PATHS = ["/category/guides", "/category/stories"]
