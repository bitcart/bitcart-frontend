import type { MessageDescriptor, Messages } from "@lingui/core"
import type { ComponentType } from "react"

import type { CheckoutSelectionMode } from "./model"
import {
  checkoutPaletteSchema,
  type CheckoutPalette,
  type CheckoutPaletteInput,
} from "./theme/palette"

export type CheckoutTemplateDefinition = {
  name: MessageDescriptor
  selection?: CheckoutSelectionMode

  //* Token overrides applied beneath the merchant palette, which wins token by token.
  colorScheme?: CheckoutPaletteInput

  //! The source-locale catalog, imported statically into the template's chunk. Production builds
  //! strip message text from the code: after a failed catalog load, these messages are the only
  //! strings available.
  sourceMessages?: Messages

  Payment: ComponentType
  Status?: ComponentType
  Select?: ComponentType
  Details?: ComponentType
  Confirming?: ComponentType
}

export type CheckoutTemplate = Omit<CheckoutTemplateDefinition, "selection" | "colorScheme"> & {
  selection: CheckoutSelectionMode
  colorScheme: CheckoutPalette | null
}

export const defineCheckoutTemplate = ({
  selection = "preselect",
  colorScheme,
  ...definition
}: CheckoutTemplateDefinition): CheckoutTemplate => ({
  selection,
  colorScheme: colorScheme ? checkoutPaletteSchema.parse(colorScheme) : null,
  ...definition,
})
