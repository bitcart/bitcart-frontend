import { FieldError } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"

import {
  CheckoutCard,
  CheckoutFooter,
  ExtensionSlot,
  useCheckout,
  useCustomerDetailsForm,
} from ".."

export const CheckoutCustomerDetailsScreen = () => {
  const { t } = useLingui()
  const { invoice, store } = useCheckout("details")
  const { form, fields, handleSubmit, submitError } = useCustomerDetailsForm()

  return (
    <CheckoutCard>
      <div className="px-5 py-4 border-border border-b">
        <div className="text-base font-bold tracking-tight truncate">{store.name}</div>

        <div className="mt-0.5 text-muted-foreground text-[11px]">
          {invoice.price} {invoice.currency}
        </div>

        <ExtensionSlot name="checkout:header-extra" className="mt-3" />
      </div>

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
