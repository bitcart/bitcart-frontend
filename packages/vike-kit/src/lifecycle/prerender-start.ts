import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { LocaleId, PseudoLocaleId } from "@bitcart/core/utils"
import type { PageContextServer } from "vike/types"

export interface OnPrerenderStartDeps<TSupportedLocaleId extends LocaleId | PseudoLocaleId> {
  supportedLocaleIds: readonly TSupportedLocaleId[]
}

/**
 * https://vike.dev/i18n#pre-rendering
 */
export const createOnPrerenderStart = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>({
  supportedLocaleIds,
}: OnPrerenderStartDeps<TSupportedLocaleId>) => {
  return function onPrerenderStart(prerenderContext: { pageContexts: PageContextServer[] }) {
    const pageContexts: PageContextServer[] = []

    for (const pageContext of prerenderContext.pageContexts) {
      // Duplicate pageContext for each locale
      for (const localeId of supportedLocaleIds) {
        const localizedPageContext = {
          ...pageContext,
          urlOriginal:
            localeId === SOURCE_LOCALE_ID
              ? pageContext.urlOriginal
              : `/${localeId}${pageContext.urlOriginal}`,
        }

        pageContexts.push({
          ...localizedPageContext,
          localeId,
        })
      }
    }

    return {
      prerenderContext: { pageContexts },
    }
  }
}
