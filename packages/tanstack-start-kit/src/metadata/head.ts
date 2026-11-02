import type { BCP47LanguageSubtag } from "@bitcart/core/i18n"
import {
  getDocumentHeadManifest,
  getPageDocumentMetadata,
  type DocumentHeadLinkTagAttributes,
  type DocumentHeadManifest,
  type DocumentHeadManifestParams,
  type PageDocumentMetadataParams,
} from "@bitcart/core/metadata"

export type DocumentHeadParams<TSupportedLocaleId extends BCP47LanguageSubtag> =
  PageDocumentMetadataParams<TSupportedLocaleId> &
    Pick<
      DocumentHeadManifestParams<TSupportedLocaleId>,
      "favicon" | "jsonLd" | "ogSiteName" | "twitterHandles" | "viewportParams"
    > & {
      isRoutingLocaleDependent?: boolean
    }

export type DocumentHead = DocumentHeadManifest & {
  title: string
}

export const getDocumentHead = <TSupportedLocaleId extends BCP47LanguageSubtag>({
  favicon,
  isRoutingLocaleDependent = false,
  jsonLd,
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
    jsonLd,
    metadata,
    ogSiteName,
    posixLocaleIdMap: pageParams.posixLocaleIdMap,
    routePath: pageParams.routePath,
    twitterHandles,
    viewportParams,
  })

  return { title: metadata.title, ...manifest }
}

//* Pass the URL the stylesheet references (a Vite `?url` import), or the font loads twice.
export const getFontPreloadLink = (href: string): DocumentHeadLinkTagAttributes => ({
  rel: "preload",
  href,
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous",
})
