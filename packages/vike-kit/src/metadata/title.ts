import type { PageContext } from "vike/types"

export const createTitle =
  (): ((pageContext: PageContext) => string) =>
  ({ metadata }: PageContext) =>
    metadata.title
