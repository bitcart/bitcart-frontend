import { createOnBeforeRoute } from "@bitcart/vike-kit/lifecycle/before-route"

import { APP_LOCALE_IDS } from "@/app.config"

export const onBeforeRoute = createOnBeforeRoute({
  supportedLocaleIds: APP_LOCALE_IDS,
})
