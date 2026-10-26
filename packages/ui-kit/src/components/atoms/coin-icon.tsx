import { createElement, Suspense, use } from "react"

import { resolveCoinIcon } from "@/coin-icons/resolve"
import { cn } from "@/utils"

export type CoinIconProps = {
  symbol: string

  //* A token's contract, matched on its CAIP-2 `network`; null for a native coin.
  contract?: string | null
  network?: string | null

  size?: number
  className?: string
}

type CoinMarkProps = Pick<CoinIconProps, "symbol" | "className"> & { size: number }

const CoinMark = ({ symbol, size, className }: CoinMarkProps) => (
  <span
    aria-hidden
    style={{ width: size, height: size, fontSize: Math.round(size * 0.31) }}
    className={cn(
      `
        bg-muted text-muted-foreground font-semibold flex shrink-0 items-center justify-center
        rounded-full uppercase
      `,
      className,
    )}
  >
    {symbol.slice(0, 4)}
  </span>
)

const ResolvedCoinIcon = ({
  symbol,
  contract = null,
  network = null,
  size,
  className,
}: CoinIconProps & { size: number }) => {
  const Icon = use(resolveCoinIcon({ symbol, contract, network }))

  //* `createElement`, as `Icon` is a module's stable export, not a component made in render.
  if (Icon === null) {
    return <CoinMark symbol={symbol} size={size} className={className} />
  } else
    return createElement(Icon, {
      size,
      "aria-hidden": true,
      className: cn("text-foreground shrink-0", className),
    })
}

/**
 * A decorative coin or token icon from web3icons. Shows the ticker in a round mark while the icon
 * loads, and for coins or tokens web3icons has no icon for.
 */
export const CoinIcon: React.FC<CoinIconProps> = ({ size = 32, ...props }) => (
  <Suspense fallback={<CoinMark symbol={props.symbol} size={size} className={props.className} />}>
    <ResolvedCoinIcon size={size} {...props} />
  </Suspense>
)
