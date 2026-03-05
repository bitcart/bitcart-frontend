import { createHead } from "@bitcart/vike-kit/metadata"

import { POSIX_LOCALE_ID_MAP } from "@/app.config"
import { PROJECT_CANONICAL_NAME } from "@/common/constants"

const Head = createHead({
  posixLocaleIdMap: POSIX_LOCALE_ID_MAP,
  projectCanonicalName: PROJECT_CANONICAL_NAME,
})

export default Head
