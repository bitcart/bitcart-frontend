import type { ComponentType } from "react"

import { useCheckout } from "../hooks"
import { CheckoutConfirmingScreen } from "../screens/confirming-screen"
import { CheckoutCustomerDetailsScreen } from "../screens/details-screen"
import { CheckoutMethodSelectScreen } from "../screens/method-select-screen"
import { CheckoutStatusScreen } from "../screens/status-screen"
import { CheckoutUnavailableScreen } from "../screens/unavailable-screen"
import { usePartialPaymentAnnouncement } from "./partial-payment-announcement"

export type CheckoutScreens = {
  Payment: ComponentType
  Status?: ComponentType
  Select?: ComponentType
  Details?: ComponentType
  Confirming?: ComponentType
}

export const CheckoutShell = ({ screens }: { screens: CheckoutScreens }) => {
  const { phase } = useCheckout()

  usePartialPaymentAnnouncement()

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
