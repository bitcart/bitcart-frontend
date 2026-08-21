import {
  type BCP47LanguageSubtag,
  type LocaleMessages,
  type PosixLocaleIdMap,
  type SourceLocaleId,
} from "@bitcart/core/i18n"
import {
  getPageDocumentMetadata,
  type DocumentMetadata,
  type StaticDocumentMetadata,
} from "@bitcart/core/metadata"
import type { RuntimeEnvTag } from "@bitcart/core/types"
import type { PageContext } from "vike/types"

import { activateLocaleMessages } from "@/i18n"

export type OnBeforeRenderDeps<TSupportedLocaleId extends BCP47LanguageSubtag> = {
  envTag: RuntimeEnvTag
  getStaticDocumentMetadata: () => StaticDocumentMetadata
  loadLocale: (locale: string) => Promise<LocaleMessages>
  posixLocaleIdMap: PosixLocaleIdMap<TSupportedLocaleId | SourceLocaleId>
  productionBaseUrl: string
  supportedLocaleIds: readonly TSupportedLocaleId[]
}

export const createOnBeforeRender = <TSupportedLocaleId extends BCP47LanguageSubtag>({
  envTag,
  getStaticDocumentMetadata,
  loadLocale,
  posixLocaleIdMap,
  productionBaseUrl,
  supportedLocaleIds,
}: OnBeforeRenderDeps<TSupportedLocaleId>) => {
  return async function onBeforeRender(
    pageContext: PageContext,
  ): Promise<{ pageContext: { metadata: DocumentMetadata; messages: LocaleMessages } }> {
    const { headers, localeId } = pageContext
    const localeMessages = await loadLocale(localeId)

    activateLocaleMessages(localeId, localeMessages)

    const baseUrl =
      typeof headers?.host === "string"
        ? `${
            envTag !== "production" ? (headers["x-forwarded-proto"] ?? "http") : "https"
          }://${headers.host}`
        : productionBaseUrl

    const metadata = getPageDocumentMetadata({
      baseUrl,
      localeId,
      posixLocaleIdMap,
      routePath: pageContext.urlOriginal,
      staticParams: getStaticDocumentMetadata(),
      supportedLocaleIds,
    })

    return {
      pageContext: {
        metadata,
        messages: localeMessages,
      },
    }
  }
}
