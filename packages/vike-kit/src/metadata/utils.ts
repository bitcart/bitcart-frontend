import type { RuntimeEnvTag } from "@bitcart/core/types"
import { type BCP47LanguageSubtag, type PosixLocaleIdLike } from "@bitcart/core/utils"
import type { PageContextServer } from "vike/types"

import type { PageContextOriginal } from "../types"
import type { LayoutMetadata, StaticLayoutMetadata } from "./types"

export type LayoutMetadataInputs = {
  envTag: RuntimeEnvTag
  pageContext: PageContextOriginal
  posixLocaleId: PosixLocaleIdLike<BCP47LanguageSubtag>
  productionBaseUrl: string
  staticParams: StaticLayoutMetadata
}

export const getLayoutMetadata = ({
  envTag,
  pageContext: { urlOriginal: pageUrl, ...pageContext },
  posixLocaleId,
  productionBaseUrl,
  staticParams,
}: LayoutMetadataInputs): LayoutMetadata => {
  const headers =
    "headers" in (pageContext as PageContextServer)
      ? (pageContext as PageContextServer).headers
      : undefined

  const baseUrl =
    typeof headers?.host === "string"
      ? `${
          envTag !== "production" ? (headers["x-forwarded-proto"] ?? "http") : "https"
        }://${headers.host}`
      : productionBaseUrl

  return {
    ...staticParams,
    baseUrl,

    image: {
      ...staticParams.image,
      secureUrl: baseUrl.includes("https://") ? baseUrl + staticParams.image.src : undefined,
    },

    locale: posixLocaleId,
    url: baseUrl + (pageUrl.endsWith("/") ? pageUrl.slice(0, -1) : pageUrl),
  }
}
