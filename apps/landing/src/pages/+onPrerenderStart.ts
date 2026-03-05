import { createOnPrerenderStart } from "@bitcart/vike-kit/lifecycle"

import { SUPPORTED_LOCALE_IDS } from "@/app.config"

/**
 * https://vike.dev/i18n#pre-rendering
 */
export const onPrerenderStart = createOnPrerenderStart({
  supportedLocaleIds: SUPPORTED_LOCALE_IDS,
})
