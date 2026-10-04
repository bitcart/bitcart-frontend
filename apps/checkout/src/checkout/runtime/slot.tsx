import { cn } from "@bitcart/ui-kit/utils"
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react"

import { useCheckout, useCheckoutAppConfig } from "../hooks"
import { ErrorBoundary } from "./error-boundary"
import {
  compareContributions,
  getSlotContext,
  isWanted,
  type ExtensionSlotContribution,
  type ExtensionSlotName,
  type SlotContextMap,
} from "./slot-contributions"

type SlotContext = SlotContextMap[ExtensionSlotName]

type SlotModule = { default: ComponentType<{ context: SlotContext }> }

const loadedComponents = new WeakMap<
  ExtensionSlotContribution,
  LazyExoticComponent<SlotModule["default"]>
>()

const getComponent = (contribution: ExtensionSlotContribution) => {
  //* A contribution renders only in its own slot, which passes it that slot's context.
  const component =
    loadedComponents.get(contribution) ?? lazy(contribution.load as () => Promise<SlotModule>)

  loadedComponents.set(contribution, component)

  return component
}

export const ExtensionSlot = ({
  name,
  className,
}: {
  name: ExtensionSlotName
  className?: string
}) => {
  const context = getSlotContext(name, useCheckout())

  const contributions = (useCheckoutAppConfig().slots ?? [])
    .filter((contribution) => contribution.slot === name && isWanted(contribution, context))
    .toSorted(compareContributions)

  return (
    <div data-extension-slot={name} className={cn("empty:hidden", className)}>
      {contributions.map((contribution, index) => {
        const Component = getComponent(contribution)

        return (
          <ErrorBoundary
            key={`${contribution.pluginId}-${index}`}
            errorMessage={`Extension slot contribution "${contribution.pluginId}" to "${name}" crashed`}
            fallback={null}
          >
            <Suspense fallback={null}>
              <Component context={context} />
            </Suspense>
          </ErrorBoundary>
        )
      })}
    </div>
  )
}
