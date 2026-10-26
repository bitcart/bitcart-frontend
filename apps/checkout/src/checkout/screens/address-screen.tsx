import {
  CheckoutCard,
  CheckoutConnectionBanner,
  CheckoutFooter,
  CheckoutHeader,
  ExpiringSoonNotice,
  ExtensionSlot,
  MethodAmount,
  PayingWith,
  SenderAddressForm,
  useCheckout,
} from ".."

export const CheckoutAddressScreen = () => {
  const { method } = useCheckout("address")

  return (
    <CheckoutCard>
      <CheckoutHeader className="border-border border-b" />
      <ExtensionSlot name="checkout:header-extra" className="px-5 py-3 border-border border-b" />
      <CheckoutConnectionBanner />
      <ExpiringSoonNotice className="px-5 py-2" />
      <PayingWith />

      <div className="px-5 pb-5 pt-4">
        <MethodAmount method={method} className="mb-5" />
        <SenderAddressForm />
      </div>

      <ExtensionSlot name="checkout:address-extra" className="px-5 py-4 border-border border-t" />
      <CheckoutFooter />
    </CheckoutCard>
  )
}
