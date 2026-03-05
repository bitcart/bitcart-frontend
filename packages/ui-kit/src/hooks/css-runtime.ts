import { useMemo } from "react"
import { useIsClient } from "usehooks-ts"

export type CssRuntimeFeatureSupportParams = {
  property: string
  value: string
}

export const useCssRuntimeFeatureSupport = ({
  property,
  value,
}: CssRuntimeFeatureSupportParams) => {
  const isClient = useIsClient()

  return useMemo(
    () => (isClient ? CSS.supports(property, value) : false),
    [isClient, property, value],
  )
}
