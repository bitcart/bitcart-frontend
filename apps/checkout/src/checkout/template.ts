import { NEUTRAL_THEME_TWEAK } from "@bitcart/unocss-kit/constants"
import type { MessageDescriptor, Messages } from "@lingui/core"
import type { ComponentType } from "react"

import type { CheckoutSelectionMode } from "./model"
import { checkoutThemeSchema, type CheckoutTheme, type CheckoutThemeInput } from "./theme/schemas"

export type CheckoutTemplateDefinition = {
  name: MessageDescriptor
  selection?: CheckoutSelectionMode

  //* Token overrides applied beneath the merchant theme, which wins token by token.
  theme?: CheckoutThemeInput

  //! The source-locale catalog, imported statically into the template's chunk. Production builds
  //! strip message text from the code: after a failed catalog load, these messages are the only
  //! strings available.
  sourceMessages?: Messages

  Payment: ComponentType
  Status?: ComponentType
  Select?: ComponentType
  Details?: ComponentType
  Address?: ComponentType
  Confirming?: ComponentType
}

export type CheckoutTemplate = Omit<CheckoutTemplateDefinition, "selection" | "theme"> & {
  selection: CheckoutSelectionMode
  theme: CheckoutTheme
}

export const defineCheckoutTemplate = ({
  selection = "preselect",
  theme,
  ...definition
}: CheckoutTemplateDefinition): CheckoutTemplate => ({
  selection,
  theme: theme ? checkoutThemeSchema.parse(theme) : NEUTRAL_THEME_TWEAK,
  ...definition,
})
