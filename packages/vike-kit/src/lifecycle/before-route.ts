import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { LocaleOrPseudoLocaleId } from "@bitcart/core/utils"
import { modifyUrl } from "vike/modifyUrl"
import type { PageContext, Url } from "vike/types"

import type { PageContextOriginal } from "../types"

export interface OnBeforeRouteDeps {
  supportedLocaleIds: readonly LocaleOrPseudoLocaleId[]
}

export const createOnBeforeRoute = ({ supportedLocaleIds }: OnBeforeRouteDeps) => {
  const extractLocale = ({ href, pathname }: Url) => {
    const leadingPathSegment = pathname.split("/").slice(1)[0]

    const routeLocaleId = supportedLocaleIds.includes(leadingPathSegment as LocaleOrPseudoLocaleId)
      ? leadingPathSegment
      : null

    const urlWithoutLocale =
      routeLocaleId === null
        ? href
        : modifyUrl(href, {
            pathname: `/${pathname.split("/").slice(2).join("/")}`,
          })

    return { localeId: routeLocaleId ?? SOURCE_LOCALE_ID, urlWithoutLocale }
  }

  return function onBeforeRoute(pageContext: PageContextOriginal): {
    pageContext: Partial<PageContext>
  } {
    const { localeId, urlWithoutLocale } = extractLocale(pageContext.urlParsed)

    return {
      pageContext: {
        localeId,

        //* Vike's router will use pageContext.urlLogical instead of pageContext.urlOriginal
        //* and the locale will not be present in pageContext.urlParsed
        urlLogical: urlWithoutLocale,
      },
    }
  }
}
