import { createOnPrerenderStart } from "@bitcart/vike-kit/lifecycle/prerender-start"

import { APP_LOCALE_IDS } from "@/app.config"

/**
 * https://vike.dev/i18n#pre-rendering
 */
export const onPrerenderStart = createOnPrerenderStart({
  supportedLocaleIds: APP_LOCALE_IDS,
})
