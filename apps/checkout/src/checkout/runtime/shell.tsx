import type { ComponentType } from "react"

import { useCheckout } from "../hooks"
import type { CheckoutSelectionMode } from "../model"
import { CheckoutConfirmingScreen } from "../screens/confirming-screen"
import { CheckoutCustomerDetailsScreen } from "../screens/details-screen"
import { CheckoutMethodSelectScreen } from "../screens/method-select-screen"
import { CheckoutStatusScreen } from "../screens/status-screen"
import { CheckoutUnavailableScreen } from "../screens/unavailable-screen"
import type { CheckoutPalette } from "../theme/palette"
import { usePartialPaymentAnnouncement } from "./partial-payment-announcement"
import { RequiredContentGuard } from "./required-content-guard"
import { CheckoutThemeScope } from "./theme-scope"

export type CheckoutScreens = {
  Payment: ComponentType
  Status?: ComponentType
  Select?: ComponentType
  Details?: ComponentType
  Confirming?: ComponentType
}

export type CheckoutShellTemplate = CheckoutScreens & {
  selection?: CheckoutSelectionMode
  colorScheme?: CheckoutPalette | null
}

const CheckoutPhaseScreen = ({ screens }: { screens: CheckoutScreens }) => {
  const { phase } = useCheckout()

  const {
    Payment,
    Status = CheckoutStatusScreen,
    Select = CheckoutMethodSelectScreen,
    Details = CheckoutCustomerDetailsScreen,
    Confirming = CheckoutConfirmingScreen,
  } = screens

  switch (phase) {
    case "payment":
      return <Payment />

    case "select":
      return <Select />

    case "status":
      return <Status />

    case "confirming":
      return <Confirming />

    case "details":
      return <Details />

    case "unavailable":
      return <CheckoutUnavailableScreen />
  }
}

export const CheckoutShell = ({
  templateId,
  template,
}: {
  templateId: string
  template: CheckoutShellTemplate
}) => {
  const { branding } = useCheckout()

  usePartialPaymentAnnouncement()

  return (
    <CheckoutThemeScope templateId={templateId} palettes={[template.colorScheme, branding.palette]}>
      <CheckoutPhaseScreen screens={template} />

      {import.meta.env.DEV && (
        <RequiredContentGuard
          templateId={templateId}
          selection={template.selection ?? "preselect"}
        />
      )}
    </CheckoutThemeScope>
  )
}
