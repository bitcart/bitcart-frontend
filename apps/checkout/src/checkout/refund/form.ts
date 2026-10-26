import { useAppForm } from "@bitcart/form-kit/hooks"
import type { SubmitErrors } from "@bitcart/form-kit/validation"
import { useLingui } from "@lingui/react/macro"
import { useSelector } from "@tanstack/react-store"
import { useState, type SubmitEvent } from "react"
import * as z from "zod"

import { getRefundAddressCoin, type CheckoutRefundPage } from "./page"

export type RefundFormStep = "address" | "review"

export const useRefundForm = ({
  method,
  submit,
}: Pick<CheckoutRefundPage, "method" | "submit">) => {
  const { t } = useLingui()
  const [step, setStep] = useState<RefundFormStep>("address")
  const coin = getRefundAddressCoin(method)

  const describeRejection = () => {
    if (coin && method?.lightning) {
      return t`This address can't receive this refund. Check it's a ${coin} address, not a Lightning invoice.`
    } else if (coin) {
      return t`This address can't receive this refund. Check it's a ${coin} address.`
    } else return t`This address can't receive this refund. Check it and try again.`
  }

  const form = useAppForm({
    defaultValues: { destination: "" },

    validators: {
      onSubmit: z.object({
        destination: z
          .string()
          .trim()
          .min(1, t`Enter your address.`),
      }),

      onSubmitAsync: async ({ value }): Promise<SubmitErrors<"destination"> | undefined> => {
        if (step === "address") return undefined

        try {
          if ((await submit(value.destination.trim())) === "accepted") {
            return undefined
          } else {
            setStep("address")

            return { fields: { destination: { message: describeRejection() } } }
          }
        } catch {
          return { form: t`Couldn't submit your refund. Please try again.`, fields: {} }
        }
      },
    },

    onSubmit: () => {
      if (step === "address") setStep("review")
    },
  })

  const submitError = useSelector(form.store, (state) => state.errorMap.onSubmit)

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return {
    form,
    step,
    coin,
    editAddress: () => setStep("address"),
    handleSubmit,
    submitError: typeof submitError === "string" ? submitError : null,
  }
}
