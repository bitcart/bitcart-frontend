import { cn } from "@bitcart/ui-kit/utils"
import type { IconComponentProps } from "@web3icons/react"
import { Suspense } from "react"

import { web3icons, web3iconsWithBackgroundVariant } from "@/common/ui/components"

const DEFAULT_ICON_SIZE_PX = 40

export type CoinCatalogEntryIconProps = IconComponentProps & {
  symbol: string
  size?: number | string
}

type CoinCatalogEntryIconFallbackProps = Pick<CoinCatalogEntryIconProps, "size"> & {
  name: string
}

const CoinCatalogEntryIconFallback: React.FC<CoinCatalogEntryIconFallbackProps> = ({
  name,
  size,
}) => (
  <div
    className={cn(`
      from-muted-foreground/20 to-muted-foreground/30 px-2
      dark:from-muted-foreground/40 dark:to-muted-foreground/25
      flex w-fit items-center justify-center rounded-full bg-linear-to-r
    `)}
    style={{ height: size }}
    aria-hidden="true"
  >
    <span className="text-foreground font-bold text-xs">{name.toUpperCase()}</span>
  </div>
)

export const CoinCatalogEntryIcon: React.FC<CoinCatalogEntryIconProps> = ({
  size = DEFAULT_ICON_SIZE_PX,
  symbol,
  variant,
  className,
  ...props
}) => {
  const componentName = `Token${symbol}`
  const Component = web3icons[componentName] === undefined ? null : web3icons[componentName]

  const resolvedVariant =
    variant === "background" && !web3iconsWithBackgroundVariant.has(componentName)
      ? undefined
      : variant

  return Component === null ? (
    <CoinCatalogEntryIconFallback size={size} name={symbol} />
  ) : (
    <Suspense fallback={<CoinCatalogEntryIconFallback size={size} name={symbol} />}>
      <Component
        width={size}
        height={size}
        aria-hidden="true"
        variant={resolvedVariant}
        className={cn(
          "text-foreground",
          { "rounded-full": resolvedVariant === "background" },
          className,
        )}
        {...props}
      >
        <CoinCatalogEntryIconFallback name={symbol} size={size} />
      </Component>
    </Suspense>
  )
}
