import { formatCalendarDate } from "@bitcart/core/utils"
import { Alert, AlertDescription } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { InfoIcon } from "lucide-react"

import { BRAND_RENAME_DATE } from "#/common/constants"

export type RenameNoteProps = {
  className?: string
}

export const RenameNote: React.FC<RenameNoteProps> = ({ className }) => {
  const { t, i18n } = useLingui()
  const renameDate = formatCalendarDate(new Date(BRAND_RENAME_DATE), i18n.locale)

  return (
    <Alert role="note" className={className}>
      <InfoIcon aria-hidden />

      <AlertDescription>
        {t`Bitcart was called BitcartCC until ${renameDate}, so this post uses the old name.`}
      </AlertDescription>
    </Alert>
  )
}
