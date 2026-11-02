import type { AuthorKey, CategoryKey } from "#/common/content/taxonomy"

export type ListFilter =
  | { kind: "all" }
  | { kind: "category"; key: CategoryKey }
  | { kind: "author"; key: AuthorKey }
