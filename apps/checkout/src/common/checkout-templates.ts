import type { CheckoutTemplate } from "#/checkout"
import { createTemplateRegistry } from "#/checkout/runtime/registry"

export const DEFAULT_CHECKOUT_TEMPLATE_ID = "accordion"

export const checkoutTemplates = createTemplateRegistry(
  import.meta.glob<{ default: CheckoutTemplate }>("../templates/*/index.ts"),
  { defaultId: DEFAULT_CHECKOUT_TEMPLATE_ID },
)
