import { createOnBeforeRoute } from "@bitcart/vike-kit/lifecycle"

import { SUPPORTED_LOCALE_IDS } from "@/app.config"

export const onBeforeRoute = createOnBeforeRoute({
  supportedLocaleIds: SUPPORTED_LOCALE_IDS,
})
