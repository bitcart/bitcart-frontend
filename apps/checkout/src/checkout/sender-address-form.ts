import { useAppForm } from "@bitcart/form-kit/hooks"
import type { SubmitErrors } from "@bitcart/form-kit/validation"
import { useLingui } from "@lingui/react/macro"
import { useSelector } from "@tanstack/react-store"
import type { SubmitEvent } from "react"
import * as z from "zod"

import { useCheckout } from "./hooks"

export const SENDER_ADDRESS_FIELD = "senderAddress"

export const useSenderAddressForm = () => {
  const { t } = useLingui()
  const { method, submitAddress } = useCheckout("address")
  const coin = method.name

  const form = useAppForm({
    defaultValues: { [SENDER_ADDRESS_FIELD]: "" },

    validators: {
      onSubmit: z.object({
        [SENDER_ADDRESS_FIELD]: z
          .string()
          .trim()
          .min(1, t`Enter your address.`),
      }),

      onSubmitAsync: async ({
        value,
      }): Promise<SubmitErrors<typeof SENDER_ADDRESS_FIELD> | undefined> => {
        try {
          if ((await submitAddress(value[SENDER_ADDRESS_FIELD].trim())) === "accepted") {
            return undefined
          } else {
            return {
              fields: {
                [SENDER_ADDRESS_FIELD]: { message: t`This isn't a valid ${coin} address.` },
              },
            }
          }
        } catch {
          return { form: t`Couldn't save your address. Please try again.`, fields: {} }
        }
      },
    },
  })

  const submitError = useSelector(form.store, (state) => state.errorMap.onSubmit)

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return {
    form,
    coin,
    handleSubmit,
    submitError: typeof submitError === "string" ? submitError : null,
  }
}
