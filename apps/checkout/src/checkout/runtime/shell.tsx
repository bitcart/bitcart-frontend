import { useEffect, useRef, type ComponentType } from "react"

import { useCheckout } from "../hooks"
import type { CheckoutModel, CheckoutSelectionMode } from "../model"
import { CheckoutAddressScreen } from "../screens/address-screen"
import { CheckoutConfirmingScreen } from "../screens/confirming-screen"
import { CheckoutCustomerDetailsScreen } from "../screens/details-screen"
import { CheckoutMethodSelectScreen } from "../screens/method-select-screen"
import { CheckoutStatusScreen } from "../screens/status-screen"
import { CheckoutUnavailableScreen } from "../screens/unavailable-screen"
import type { CheckoutPalette } from "../theme/palette"
import { WalletPayRuntime } from "../wallet-pay/runtime"
import { usePartialPaymentAnnouncement } from "./partial-payment-announcement"
import { RequiredContentGuard } from "./required-content-guard"
import { CheckoutThemeScope } from "./theme-scope"

export type CheckoutScreens = {
  Payment: ComponentType
  Status?: ComponentType
  Select?: ComponentType
  Details?: ComponentType
  Address?: ComponentType
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
    Address = CheckoutAddressScreen,
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

    case "address":
      return <Address />

    case "unavailable":
      return <CheckoutUnavailableScreen />
  }
}

const STEP_PHASES: CheckoutModel["phase"][] = ["select", "address", "payment"]

const isStepChange = (from: CheckoutModel["phase"], to: CheckoutModel["phase"]) =>
  from !== to && STEP_PHASES.includes(from) && STEP_PHASES.includes(to)

const useViewFocusOnStepChange = () => {
  const { phase } = useCheckout()
  const root = useRef<HTMLDivElement>(null)
  const previousPhase = useRef(phase)

  useEffect(() => {
    const from = previousPhase.current
    const view = root.current?.firstElementChild

    previousPhase.current = phase

    if (
      isStepChange(from, phase) &&
      view instanceof HTMLElement &&
      !root.current?.contains(document.activeElement) &&
      !document.activeElement?.closest('[role="dialog"]')
    ) {
      if (view.getBoundingClientRect().top < 0) {
        const isMotionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

        view.scrollIntoView({ block: "start", behavior: isMotionReduced ? "auto" : "smooth" })
      }

      if (!view.hasAttribute("tabindex")) view.tabIndex = -1

      view.focus({ preventScroll: true })
    }
  }, [phase])

  return root
}

export const CheckoutShell = ({
  templateId,
  template,
}: {
  templateId: string
  template: CheckoutShellTemplate
}) => {
  const { branding } = useCheckout()
  const rootRef = useViewFocusOnStepChange()

  usePartialPaymentAnnouncement()

  return (
    <CheckoutThemeScope scopeId={templateId} palettes={[template.colorScheme, branding.palette]}>
      <div ref={rootRef} data-checkout-template={templateId} className="contents">
        <CheckoutPhaseScreen screens={template} />

        {import.meta.env.DEV && (
          <RequiredContentGuard
            templateId={templateId}
            selection={template.selection ?? "preselect"}
          />
        )}
      </div>

      <WalletPayRuntime />
    </CheckoutThemeScope>
  )
}
