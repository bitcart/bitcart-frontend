import {
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_COUNTDOWN_TESTID,
  CHECKOUT_METHOD_SELECTOR_TESTID,
  CHECKOUT_OPEN_WALLET_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_PAYMENT_QR_TESTID,
  CHECKOUT_PAYMENT_URI_TESTID,
  CHECKOUT_RECOMMENDED_FEE_TESTID,
  CHECKOUT_REQUIRED_CONTENT_GUARD_TESTID,
  CHECKOUT_STATUS_TESTID,
} from "@bitcart/qa"
import { useEffect, useRef } from "react"

import { useCheckout } from "../hooks"
import type { CheckoutModel, CheckoutSelectionMode } from "../model"
import type { ExtensionSlotName } from "./slot-contributions"

const SETTLE_DELAY_MS = 100

const SLOTS_BY_PHASE: Record<CheckoutModel["phase"], ExtensionSlotName[]> = {
  payment: ["checkout:header-extra", "checkout:payment-extra", "checkout:footer-extra"],
  status: ["checkout:header-extra", "checkout:status-extra", "checkout:footer-extra"],
  select: ["checkout:header-extra", "checkout:footer-extra"],
  details: ["checkout:header-extra", "checkout:footer-extra"],
  confirming: ["checkout:header-extra", "checkout:footer-extra"],
  unavailable: ["checkout:header-extra", "checkout:footer-extra"],
}

type Requirement = { label: string; isMet: (root: Element) => boolean }

const byTestId = (testId: string) => (root: Element) =>
  root.querySelector(`[data-testid="${testId}"]`) !== null

const requirement = (label: string, isMet: Requirement["isMet"]): Requirement => ({ label, isMet })

const getContentRequirements = (
  model: CheckoutModel,
  selection: CheckoutSelectionMode,
): Requirement[] => {
  if (model.phase === "payment") {
    const { payment, methods } = model

    return [
      requirement("amount", (root) =>
        Boolean(
          root
            .querySelector(`[data-testid="${CHECKOUT_AMOUNT_TESTID}"]`)
            ?.textContent?.includes(payment.amount),
        ),
      ),

      requirement("countdown", byTestId(CHECKOUT_COUNTDOWN_TESTID)),
      requirement("payment address", byTestId(CHECKOUT_PAYMENT_ADDRESS_TESTID)),

      requirement(
        "payment URI or QR code",
        (root) =>
          byTestId(CHECKOUT_PAYMENT_QR_TESTID)(root) || byTestId(CHECKOUT_PAYMENT_URI_TESTID)(root),
      ),

      ...(payment.recommendedFee === null
        ? []
        : [requirement("recommended fee", byTestId(CHECKOUT_RECOMMENDED_FEE_TESTID))]),

      ...(payment.paymentUrl === null
        ? []
        : [requirement("open-wallet action", byTestId(CHECKOUT_OPEN_WALLET_TESTID))]),

      //* An explicit-selection template offers method switching in its select phase.
      ...(selection === "preselect" && methods.length > 1
        ? [requirement("method selector", byTestId(CHECKOUT_METHOD_SELECTOR_TESTID))]
        : []),
    ]
  } else if (model.phase === "select") {
    return [requirement("method selector", byTestId(CHECKOUT_METHOD_SELECTOR_TESTID))]
  } else if (model.phase === "status") {
    return [requirement("status", byTestId(CHECKOUT_STATUS_TESTID))]
  } else if (model.phase === "details") {
    return model.details.fields.map((field) =>
      requirement(
        `details input "${field}"`,
        (root) => root.querySelector(`[name="${field}"]`) !== null,
      ),
    )
  } else return []
}

const findMissingContent = (
  root: Element,
  model: CheckoutModel,
  selection: CheckoutSelectionMode,
): string[] => [
  ...getContentRequirements(model, selection)
    .filter(({ isMet }) => !isMet(root))
    .map(({ label }) => label),

  ...SLOTS_BY_PHASE[model.phase]
    .filter((slot) => !root.querySelector(`[data-extension-slot="${slot}"]`))
    .map((slot) => `slot "${slot}"`),
]

export const RequiredContentGuard = ({
  templateId,
  selection,
}: {
  templateId: string
  selection: CheckoutSelectionMode
}) => {
  const model = useCheckout()
  const markerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const marker = markerRef.current
    const root = marker?.closest("[data-checkout-template]")

    if (!marker || !root) return void null

    let timeout: ReturnType<typeof setTimeout> | undefined

    const check = () => {
      const missing = findMissingContent(root, model, selection).join(", ")

      if (missing && missing !== marker.dataset.missing) {
        console.warn(
          `Checkout template "${templateId}" is missing required content in the "${model.phase}" phase: ${missing}`,
        )
      }

      marker.dataset.missing = missing
    }

    const scheduleCheck = () => {
      clearTimeout(timeout)
      timeout = setTimeout(check, SETTLE_DELAY_MS)
    }

    const observer = new MutationObserver(scheduleCheck)

    observer.observe(root, { childList: true, subtree: true, characterData: true })
    scheduleCheck()

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [model, selection, templateId])

  return <span ref={markerRef} hidden data-testid={CHECKOUT_REQUIRED_CONTENT_GUARD_TESTID} />
}
