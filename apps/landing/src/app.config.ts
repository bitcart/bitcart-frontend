import { PSEUDO_LOCALE_ID, type PosixLocaleIdMap } from "@bitcart/core/i18n"
import type { StaticDocumentMetadata } from "@bitcart/core/metadata"
import { t } from "@lingui/core/macro"

import { BRAND_UMBRELLA_NAME } from "@/common/constants"

import { SUPPORTED_LOCALE_IDS } from "../constants"
import { env } from "./env"

export { SUPPORTED_LOCALE_IDS }

export const APP_LOCALE_IDS =
  env.BITCART_ENV === "production"
    ? SUPPORTED_LOCALE_IDS
    : [...SUPPORTED_LOCALE_IDS, PSEUDO_LOCALE_ID]

export const APP_POSIX_LOCALE_ID_MAP: PosixLocaleIdMap<(typeof SUPPORTED_LOCALE_IDS)[number]> = {
  be: "be_BY",
  de: "de_DE",
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  hi: "hi_IN",
  ko: "ko_KR",
  pl: "pl_PL",
  ru: "ru_RU",
  tr: "tr_TR",
  uk: "uk_UA",
}

export const getAppDocumentMetadata = (): StaticDocumentMetadata => ({
  title: t`Bitcart - Non-Custodial Crypto Payments Processor`,

  description: t`Your self-hosted, open-source cryptocurrency all-in-one solution. Accept crypto and stablecoins payments and develop custom apps with ease`,

  image: {
    src: "/logo.png",
    alt: `${BRAND_UMBRELLA_NAME} ${t`logo`}`,
    type: "image/png",
    width: "600",
    height: "532",
  },

  author: "MrNaif2018",
})
