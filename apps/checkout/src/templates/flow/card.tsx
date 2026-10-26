import {
  CheckoutCard,
  CheckoutConnectionBanner,
  CheckoutFooter,
  CheckoutHeader,
  ExpiringSoonNotice,
  ExtensionSlot,
} from "#/checkout"

export const FlowCard = ({ children }: { children: React.ReactNode }) => (
  <CheckoutCard>
    <CheckoutHeader className="border-border border-b" />
    <ExtensionSlot name="checkout:header-extra" className="px-5 py-3 border-border border-b" />
    <CheckoutConnectionBanner />
    <ExpiringSoonNotice className="px-5 py-2" />

    {children}

    <CheckoutFooter />
  </CheckoutCard>
)
