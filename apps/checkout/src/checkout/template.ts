import type { MessageDescriptor } from "@lingui/core"
import type { ComponentType } from "react"

import type { CheckoutSelectionMode } from "./model"

export type CheckoutTemplateDefinition = {
  name: MessageDescriptor
  selection?: CheckoutSelectionMode
  Payment: ComponentType
  Status?: ComponentType
  Select?: ComponentType
  Details?: ComponentType
  Confirming?: ComponentType
}

export type CheckoutTemplate = Required<Pick<CheckoutTemplateDefinition, "selection">> &
  CheckoutTemplateDefinition

export const defineCheckoutTemplate = ({
  selection = "preselect",
  ...definition
}: CheckoutTemplateDefinition): CheckoutTemplate => ({ selection, ...definition })
