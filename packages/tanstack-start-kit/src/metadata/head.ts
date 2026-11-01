import type { BCP47LanguageSubtag } from "@bitcart/core/i18n"
import {
  getDocumentHeadManifest,
  getPageDocumentMetadata,
  type DocumentHeadManifest,
  type DocumentHeadManifestParams,
  type PageDocumentMetadataParams,
} from "@bitcart/core/metadata"

export type DocumentHeadParams<TSupportedLocaleId extends BCP47LanguageSubtag> =
  PageDocumentMetadataParams<TSupportedLocaleId> &
    Pick<
      DocumentHeadManifestParams<TSupportedLocaleId>,
      "favicon" | "ogSiteName" | "twitterHandles" | "viewportParams"
    > & {
      isRoutingLocaleDependent?: boolean
    }

export type DocumentHead = DocumentHeadManifest & {
  title: string
}

export const getDocumentHead = <TSupportedLocaleId extends BCP47LanguageSubtag>({
  favicon,
  isRoutingLocaleDependent = false,
  ogSiteName,
  twitterHandles,
  viewportParams,
  ...pageParams
}: DocumentHeadParams<TSupportedLocaleId>): DocumentHead => {
  const metadata = getPageDocumentMetadata(pageParams)

  const manifest = getDocumentHeadManifest({
    favicon,
    isCharsetSetElsewhere: false,
    isOgTitleSetElsewhere: false,
    isRoutingLocaleDependent,
    metadata,
    ogSiteName,
    posixLocaleIdMap: pageParams.posixLocaleIdMap,
    routePath: pageParams.routePath,
    twitterHandles,
    viewportParams,
  })

  return { title: metadata.title, ...manifest }
}
