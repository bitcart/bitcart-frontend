import { FieldError } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"

import {
  CheckoutCard,
  CheckoutFooter,
  CheckoutHeader,
  ExtensionSlot,
  useCustomerDetailsForm,
} from ".."

export const CheckoutCustomerDetailsScreen = () => {
  const { t } = useLingui()
  const { form, fields, handleSubmit, submitError } = useCustomerDetailsForm()

  return (
    <CheckoutCard>
      <CheckoutHeader className="border-border border-b" />
      <ExtensionSlot name="checkout:header-extra" className="px-5 py-3 border-border border-b" />

      <form onSubmit={handleSubmit} noValidate className="p-5 gap-4 flex flex-col">
        <p className="text-muted-foreground text-sm">
          {t`The store needs a few details before you pay.`}
        </p>

        {fields.includes("email") && (
          <form.AppField name="email">
            {(field) => <field.TextField required type="email" label={t`Email`} />}
          </form.AppField>
        )}

        {fields.includes("address") && (
          <form.AppField name="address">
            {(field) => <field.TextareaField required label={t`Shipping address`} />}
          </form.AppField>
        )}

        {fields.includes("notes") && (
          <form.AppField name="notes">
            {(field) => (
              <field.TextareaField
                label={t`Notes`}
                description={t`Anything the store should know about your order, such as delivery instructions.`}
              />
            )}
          </form.AppField>
        )}

        {submitError && <FieldError>{submitError}</FieldError>}

        <form.AppForm>
          <form.SubmitButton label={t`Continue to payment`} />
        </form.AppForm>
      </form>

      <CheckoutFooter />
    </CheckoutCard>
  )
}
