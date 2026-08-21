import { createOnBeforeRender } from "@bitcart/vike-kit/lifecycle/before-render"

import { APP_POSIX_LOCALE_ID_MAP, SUPPORTED_LOCALE_IDS, getAppDocumentMetadata } from "@/app.config"
import { ENV_TAG, PRODUCTION_BASE_URL } from "@/common/constants"
import { loadLocale } from "@/common/i18n"

export const onBeforeRender = createOnBeforeRender({
  envTag: ENV_TAG,
  getStaticDocumentMetadata: getAppDocumentMetadata,
  loadLocale,
  posixLocaleIdMap: APP_POSIX_LOCALE_ID_MAP,
  productionBaseUrl: PRODUCTION_BASE_URL,
  supportedLocaleIds: SUPPORTED_LOCALE_IDS,
})
