import { entries, isDefined } from "remeda"

import { definedEntries } from "@/common/utils"

import type { TwitterHandle } from "../common/types"
import {
  getPosixLocaleId,
  SOURCE_LOCALE_ID,
  type BCP47LanguageSubtag,
  type PosixLocaleIdMap,
  type SourceLocaleId,
} from "../i18n"
import { DEFAULT_FAVICON, DEFAULT_VIEWPORT_PARAMS, VIEWPORT_PARAM_NAMES } from "./constants"
import type {
  DocumentFavicon,
  DocumentHeadLinkTagAttributes,
  DocumentHeadManifest,
  DocumentHeadMetaTagAttributes,
  DocumentMetadata,
  DocumentViewportParams,
  StaticDocumentMetadata,
} from "./types"

export const serializeViewportParams = (params: DocumentViewportParams): string =>
  entries(VIEWPORT_PARAM_NAMES)
    .filter(([key]) => isDefined(params[key]))
    .map(([key, name]) => `${name}=${params[key]}`)
    .join(", ")

const getNamedMetaTagAttrsList = (
  contents: Record<string, string | undefined>,
): DocumentHeadMetaTagAttributes[] =>
  definedEntries(contents).map(([name, content]) => ({ name, content }))

const getPropertyMetaTagAttrsList = (
  contents: Record<string, string | undefined>,
): DocumentHeadMetaTagAttributes[] =>
  definedEntries(contents).map(([property, content]) => ({ property, content }))

export type PageDocumentMetadataParams<TSupportedLocaleId extends BCP47LanguageSubtag> = {
  baseUrl: string
  localeId: string
  posixLocaleIdMap: PosixLocaleIdMap<TSupportedLocaleId | SourceLocaleId>
  routePath: string
  staticParams: StaticDocumentMetadata
  supportedLocaleIds: readonly TSupportedLocaleId[]
}

export const getPageDocumentMetadata = <TSupportedLocaleId extends BCP47LanguageSubtag>({
  baseUrl,
  localeId,
  posixLocaleIdMap,
  routePath,
  staticParams,
  supportedLocaleIds,
}: PageDocumentMetadataParams<TSupportedLocaleId>): DocumentMetadata => {
  return {
    ...staticParams,
    baseUrl,

    image: {
      ...staticParams.image,
      secureUrl: baseUrl.includes("https://") ? baseUrl + staticParams.image.src : undefined,
    },

    locale: getPosixLocaleId({ localeId, posixLocaleIdMap, supportedLocaleIds }),
    url: baseUrl + (routePath.endsWith("/") ? routePath.slice(0, -1) : routePath),
  }
}

export type DocumentHeadManifestParams<TSupportedLocaleId extends BCP47LanguageSubtag> = {
  favicon?: DocumentFavicon
  isCharsetSetElsewhere: boolean
  isOgTitleSetElsewhere: boolean
  isRoutingLocaleDependent: boolean
  metadata: DocumentMetadata
  ogSiteName: string
  posixLocaleIdMap: PosixLocaleIdMap<TSupportedLocaleId | SourceLocaleId>
  routePath: string
  twitterHandles?: { author?: TwitterHandle; site?: TwitterHandle }
  viewportParams?: DocumentViewportParams
}

export const getDocumentHeadManifest = <TSupportedLocaleId extends BCP47LanguageSubtag>({
  favicon = DEFAULT_FAVICON,
  isCharsetSetElsewhere,
  isOgTitleSetElsewhere,
  isRoutingLocaleDependent,
  metadata,
  ogSiteName,
  posixLocaleIdMap,
  routePath,
  twitterHandles,
  viewportParams = DEFAULT_VIEWPORT_PARAMS,
}: DocumentHeadManifestParams<TSupportedLocaleId>): DocumentHeadManifest => {
  const { author, baseUrl, description, image, locale, title, url } = metadata
  const normalizedRoutePath = routePath === "/" ? "" : routePath

  const localizedUrl = (localeId: string): string =>
    localeId === SOURCE_LOCALE_ID
      ? `${baseUrl}${normalizedRoutePath}`
      : `${baseUrl}/${localeId}${normalizedRoutePath}`

  const localeEntries = isRoutingLocaleDependent ? entries(posixLocaleIdMap) : []

  const alternateLinks: DocumentHeadLinkTagAttributes[] = isRoutingLocaleDependent
    ? [
        ...localeEntries.map(([localeId]) => ({
          rel: "alternate",
          href: localizedUrl(localeId),
          hrefLang: localeId,
          type: "text/html",
        })),

        {
          rel: "alternate",
          href: localizedUrl(SOURCE_LOCALE_ID),
          hrefLang: "x-default",
          type: "text/html",
        },
      ]
    : []

  return {
    meta: [
      ...(isCharsetSetElsewhere ? [] : [{ charSet: "utf-8" }]),

      ...getNamedMetaTagAttrsList({
        viewport: serializeViewportParams(viewportParams),
        description,
        author,
        "twitter:title": title,
        "twitter:description": description,
        "twitter:url": url,
        "twitter:card": image.secureUrl ? "summary" : undefined,
        "twitter:image": image.secureUrl,
        "twitter:image:alt": image.secureUrl ? image.alt : undefined,
        "twitter:site": twitterHandles?.site,
        "twitter:creator": twitterHandles?.author,
      }),

      ...getPropertyMetaTagAttrsList({
        "og:title": isOgTitleSetElsewhere ? undefined : title,
        "og:description": description,
        "og:url": url,
        "og:type": "website",
        "og:site_name": ogSiteName,
        "og:locale": locale,
        "og:image": `${baseUrl}${image.src}`,
        "og:image:alt": image.alt,
        "og:image:type": image.type,
        "og:image:width": image.width,
        "og:image:height": image.height,
        "og:image:secure_url": image.secureUrl,
      }),

      ...localeEntries
        .filter(([, posixLocaleId]) => posixLocaleId !== locale)
        .map(([, posixLocaleId]) => ({ property: "og:locale:alternate", content: posixLocaleId })),
    ],

    links: [
      { rel: "icon", type: favicon.type, href: favicon.href },
      { rel: "canonical", href: url },
      ...alternateLinks,
    ],
  }
}
