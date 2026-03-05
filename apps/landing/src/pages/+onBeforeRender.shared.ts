import { createLoadCatalog } from "@bitcart/vike-kit/i18n"
import { createOnBeforeRender } from "@bitcart/vike-kit/lifecycle"

import { POSIX_LOCALE_ID_MAP } from "@/app.config"
import { ENV_TAG, PRODUCTION_BASE_URL } from "@/common/constants"
import { AVAILABLE_LOCALE_MODULES } from "@/common/i18n"
import { getLayoutMetadata } from "@/pages/layout.config"

export const onBeforeRender = createOnBeforeRender({
  envTag: ENV_TAG,
  getStaticMetadata: getLayoutMetadata,
  loadCatalog: createLoadCatalog(AVAILABLE_LOCALE_MODULES),
  posixLocaleIdMap: POSIX_LOCALE_ID_MAP,
  productionBaseUrl: PRODUCTION_BASE_URL,
})
