import { SOURCE_LOCALE_ID, type PosixLocaleIdMap, type SourceLocaleId } from "@bitcart/core/i18n"
import {
  BITCART_ORGANIZATION_JSON_LD,
  type DocumentImageMimeType,
  type JsonLd,
  type JsonLdBreadcrumb,
  type JsonLdOrganization,
  type StaticDocumentMetadata,
} from "@bitcart/core/metadata"
import { getDocumentHead } from "@bitcart/tanstack-start-kit/metadata"

import { BLOG_NAME, BRAND_X_HANDLE, DEFAULT_SHARE_IMAGE, PRODUCTION_BASE_URL } from "./constants"
import { getImageSize, getMediaUrl } from "./content/media"

const POSIX_LOCALE_ID_MAP: PosixLocaleIdMap<SourceLocaleId> = { en: "en_US" }

const IMAGE_MIME_TYPES: Record<string, DocumentImageMimeType> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
}

export const BLOG_PUBLISHER: JsonLdOrganization = {
  name: BITCART_ORGANIZATION_JSON_LD.name,
  url: BITCART_ORGANIZATION_JSON_LD.url,
}

export const getAbsoluteUrl = (path: string): string =>
  path === "/" ? PRODUCTION_BASE_URL : `${PRODUCTION_BASE_URL}${path}`

export const getBlogBreadcrumb = (): JsonLdBreadcrumb => ({
  name: BLOG_NAME,
  url: getAbsoluteUrl("/"),
})

export type PageHeadParams = {
  routePath: string
  title?: string
  description: string
  author?: string
  image?: { src: string; alt: string }
  jsonLd?: readonly JsonLd[]
}

//* Shares the original file rather than a WebP variant, which some link previews don't show.
const getShareImage = ({
  src,
  alt,
}: NonNullable<PageHeadParams["image"]> = DEFAULT_SHARE_IMAGE): StaticDocumentMetadata["image"] => {
  const { width, height } = getImageSize(src)

  return {
    src: getMediaUrl(src),
    alt,
    type: IMAGE_MIME_TYPES[src.split(".").at(-1) ?? ""] ?? "image/png",
    width: String(width),
    height: String(height),
  }
}

export const getPageHead = ({
  routePath,
  title,
  description,
  author,
  image,
  jsonLd,
}: PageHeadParams) => {
  const head = getDocumentHead({
    baseUrl: PRODUCTION_BASE_URL,
    jsonLd,
    localeId: SOURCE_LOCALE_ID,
    ogSiteName: BLOG_NAME,
    posixLocaleIdMap: POSIX_LOCALE_ID_MAP,
    routePath,
    supportedLocaleIds: [SOURCE_LOCALE_ID],
    twitterHandles: { site: BRAND_X_HANDLE },

    staticParams: {
      author,
      title: title ? `${title} · ${BLOG_NAME}` : BLOG_NAME,
      description,
      image: getShareImage(image),
    },
  })

  return { meta: [{ title: head.title }, ...head.meta], links: head.links, scripts: head.scripts }
}
