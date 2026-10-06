import type { I18n } from "@lingui/core"
import { msg } from "@lingui/core/macro"

export const getTargetBlankA11yHint = (i18n: I18n): string => i18n.t(msg` (opens in new tab)`)
