import "@testing-library/jest-dom/vitest"
import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { mockMatchMedia } from "@bitcart/qa/unit"
import { toast } from "@bitcart/ui-kit/utils"
import { i18n } from "@lingui/core"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

i18n.loadAndActivate({ locale: SOURCE_LOCALE_ID, messages: {} })

//* The theme provider and the toast host query media features on mount.
mockMatchMedia()

afterEach(() => {
  cleanup()

  //* A newly mounted toast host replays every active toast, including toasts from earlier tests.
  toast.dismiss()
})
