import { CustomerUpdateData } from "@bitcart/api-sdk/schemas"
import { getNormalizedErrorMessage } from "@bitcart/api-sdk/utils"
import { useAppForm } from "@bitcart/form-kit/hooks"
import { useMemo, useState, type FormEvent } from "react"
import * as zod from "zod"

import { useCheckout } from "./hooks"
import type { CustomerDetailsField } from "./model"

//* The API's email format without its `""` alternative, which only exists to clear the field.
const [requiredEmailSchema] = CustomerUpdateData.shape.buyer_email.unwrap().options

//* Fields not requested by the store stay in the form, but are neither validated nor submitted.
const getCustomerDetailsSchema = (fields: CustomerDetailsField[]) =>
  zod.object({
    email: fields.includes("email") ? requiredEmailSchema : zod.string(),
    address: fields.includes("address") ? zod.string().trim().min(1) : zod.string(),
    notes: zod.string(),
  })

/**
 * The form for the customer details required by a store before payment. It validates only the
 * requested fields, and saving them advances the checkout to payment.
 */
export const useCustomerDetailsForm = () => {
  const { details } = useCheckout("details")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const validationSchema = useMemo(() => getCustomerDetailsSchema(details.fields), [details.fields])

  const form = useAppForm({
    defaultValues: { email: "", address: "", notes: "" },
    validators: { onSubmit: validationSchema },

    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await details.submit(value)
      } catch (error) {
        setSubmitError(getNormalizedErrorMessage(error))
      }
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return { form, fields: details.fields, handleSubmit, submitError }
}
