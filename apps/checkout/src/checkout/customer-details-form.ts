import { CustomerUpdateData } from "@bitcart/client-sdk/schemas"
import { getRejectedFieldNames } from "@bitcart/client-sdk/utils"
import { useAppForm } from "@bitcart/form-kit/hooks"
import { toSubmitErrors } from "@bitcart/form-kit/validation"
import { t } from "@lingui/core/macro"
import { useSelector } from "@tanstack/react-store"
import { useMemo, type SubmitEvent } from "react"
import { pick } from "remeda"
import * as z from "zod"

import { useCheckout } from "./hooks"
import { CUSTOMER_DETAILS_UPDATE_KEYS, type CustomerDetailsField } from "./model"

//* The API's email format without its `""` alternative, which only exists to clear the field.
const [requiredEmailSchema] = CustomerUpdateData.shape.buyer_email.unwrap().options

//* Fields not requested by the store stay in the form, but are neither validated nor submitted.
const getCustomerDetailsSchema = (fields: CustomerDetailsField[]) =>
  z.object({
    email: fields.includes("email") ? requiredEmailSchema : z.string(),
    address: fields.includes("address") ? z.string().trim().min(1) : z.string(),
    notes: z.string(),
  })

const describeRejection = (field: CustomerDetailsField) =>
  field === "email" ? t`Enter a valid email address.` : t`Check this and try again.`

/**
 * The form for the customer details required by a store before payment. It validates only the
 * requested fields, and saving them advances the checkout to payment.
 */
export const useCustomerDetailsForm = () => {
  const { details } = useCheckout("details")
  const validationSchema = useMemo(() => getCustomerDetailsSchema(details.fields), [details.fields])

  const form = useAppForm({
    defaultValues: { email: "", address: "", notes: "" },

    validators: {
      onSubmit: validationSchema,

      onSubmitAsync: async ({ value }) => {
        try {
          await details.submit(value)

          return undefined
        } catch (error) {
          return toSubmitErrors({
            rejected: getRejectedFieldNames(error),
            fieldNames: pick(CUSTOMER_DETAILS_UPDATE_KEYS, details.fields),
            describe: describeRejection,
            fallback: t`Couldn't save your details. Please try again.`,
          })
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
    fields: details.fields,
    handleSubmit,
    submitError: typeof submitError === "string" ? submitError : null,
  }
}
