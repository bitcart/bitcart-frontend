import type { RuntimeEnvTag } from "@bitcart/core/types"
import { type BCP47LanguageSubtag, type PosixLocaleIdMap } from "@bitcart/core/utils"
import type { PageContext } from "vike/types"

import { activateLocaleMessages, type LocaleMessages } from "@/i18n"
import { getLayoutMetadata, type StaticLayoutMetadata } from "@/metadata"

export type OnBeforeRenderDeps<TSupportedLocaleId extends BCP47LanguageSubtag> = {
  envTag: RuntimeEnvTag
  getStaticMetadata: () => StaticLayoutMetadata
  loadCatalog: (locale: string) => Promise<LocaleMessages>
  posixLocaleIdMap: PosixLocaleIdMap<TSupportedLocaleId>
  productionBaseUrl: string
}

export const createOnBeforeRender = <TSupportedLocaleId extends BCP47LanguageSubtag>({
  envTag,
  getStaticMetadata,
  loadCatalog,
  posixLocaleIdMap,
  productionBaseUrl,
}: OnBeforeRenderDeps<TSupportedLocaleId>) => {
  return async function onBeforeRender(pageContext: PageContext) {
    const { localeId } = pageContext
    const messages = await loadCatalog(localeId as TSupportedLocaleId)

    activateLocaleMessages(localeId as TSupportedLocaleId, messages)

    const metadata = getLayoutMetadata({
      envTag,
      pageContext,
      posixLocaleId: posixLocaleIdMap[localeId as TSupportedLocaleId],
      productionBaseUrl,
      staticParams: getStaticMetadata(),
    })

    return {
      pageContext: {
        metadata,
        messages,
      },
    }
  }
}
