import type { PageContext } from "vike/types"

export const createTitle =
  () =>
  ({ metadata }: PageContext) =>
    metadata.title
