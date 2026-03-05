import type { PageContext } from "vike/types"

export const createLang = () => {
  return (pageContext: PageContext) => {
    return pageContext.localeId
  }
}
