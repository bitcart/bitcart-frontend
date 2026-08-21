import { createHead } from "@bitcart/vike-kit/metadata"

import { APP_POSIX_LOCALE_ID_MAP } from "@/app.config"
import { BRAND_X_HANDLE, PROJECT_CANONICAL_NAME } from "@/common/constants"

const Head = createHead({
  ogSiteName: PROJECT_CANONICAL_NAME,
  posixLocaleIdMap: APP_POSIX_LOCALE_ID_MAP,
  twitterHandles: { author: BRAND_X_HANDLE, site: BRAND_X_HANDLE },
})

export default Head
