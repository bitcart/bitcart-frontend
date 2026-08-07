import type { PageContext } from "vike/types"

export const createLang = (): ((pageContext: PageContext) => string) => {
  return (pageContext: PageContext) => {
    return pageContext.localeId
  }
}
