//* Ported from: https://ui.shadcn.com

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

export type CollapsibleProps = CollapsiblePrimitive.Root.Props & {}

export const Collapsible: React.FC<CollapsibleProps> = ({ ...props }) => {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

export type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props & {}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ ...props }) => {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

export type CollapsibleContentProps = CollapsiblePrimitive.Panel.Props & {}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ ...props }) => {
  return <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
}
