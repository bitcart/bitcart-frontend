import type { IconComponentProps } from "@web3icons/react"
import { Suspense } from "react"

import { web3icons } from "@/common/ui/components"

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
    className={`
      from-gray-200 to-gray-300 px-2
      dark:from-gray-500 dark:to-gray-600
      flex w-fit items-center justify-center rounded-full bg-linear-to-r
    `}
    style={{ height: size }}
  >
    <span className="text-foreground font-bold text-xs">{name.toUpperCase()}</span>
  </div>
)

export const CoinCatalogEntryIcon: React.FC<CoinCatalogEntryIconProps> = ({
  size = DEFAULT_ICON_SIZE_PX,
  symbol,
  ...props
}) => {
  const Component = web3icons[`Token${symbol}`] === undefined ? null : web3icons[`Token${symbol}`]

  return Component === null ? (
    <CoinCatalogEntryIconFallback size={size} name={symbol} />
  ) : (
    <Suspense fallback={<CoinCatalogEntryIconFallback size={size} name={symbol} />}>
      <Component
        width={size}
        height={size}
        aria-label={symbol}
        className="color-foreground"
        {...props}
      >
        <CoinCatalogEntryIconFallback name={symbol} size={size} />
      </Component>
    </Suspense>
  )
}
