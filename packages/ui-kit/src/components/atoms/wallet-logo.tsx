import type { IconComponentProps } from "@web3icons/react"
import { WalletIcon } from "lucide-react"
import { createElement, Suspense, use, type ComponentType } from "react"

import { cn } from "@/utils"

type WalletLogoComponent = ComponentType<IconComponentProps>

const WALLET_LOGO_LOADERS: Partial<
  Record<string, () => Promise<{ default: WalletLogoComponent }>>
> = {
  metamask: () => import("@web3icons/react/icons/wallets/WalletMetamask"),
  trust: () => import("@web3icons/react/icons/wallets/WalletTrust"),
}

const resolvedLogos = new Map<string, Promise<WalletLogoComponent | null>>()

const resolveWalletLogo = (
  id: string,
  load: () => Promise<{ default: WalletLogoComponent }>,
): Promise<WalletLogoComponent | null> => {
  const cached = resolvedLogos.get(id)

  if (cached !== undefined) {
    return cached
  } else {
    const resolved = load()
      .then((module) => module.default)
      .catch(() => {
        resolvedLogos.delete(id)

        return null
      })

    resolvedLogos.set(id, resolved)

    return resolved
  }
}

export type WalletLogoProps = {
  src?: string | null

  id?: string | null

  size?: number
  className?: string
}

type WalletMarkProps = Pick<WalletLogoProps, "className"> & { size: number }

const WalletMark = ({ size, className }: WalletMarkProps) => (
  <span
    aria-hidden
    style={{ width: size, height: size }}
    className={cn(
      "rounded-lg bg-muted text-muted-foreground flex shrink-0 items-center justify-center",
      className,
    )}
  >
    <WalletIcon style={{ width: size * 0.55, height: size * 0.55 }} />
  </span>
)

const ResolvedWalletLogo = ({
  id,
  load,
  size,
  className,
}: WalletMarkProps & { id: string; load: () => Promise<{ default: WalletLogoComponent }> }) => {
  const Logo = use(resolveWalletLogo(id, load))

  if (Logo === null) {
    return <WalletMark size={size} className={className} />
  } else
    return createElement(Logo, {
      size,
      style: { width: size, height: size },
      variant: "branded",
      "aria-hidden": true,
      className: cn("shrink-0", className),
    })
}

export const WalletLogo: React.FC<WalletLogoProps> = ({ src, id, size = 32, className }) => {
  const load = id ? WALLET_LOGO_LOADERS[id] : undefined

  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden
        width={size}
        height={size}
        className={cn("rounded-lg shrink-0 object-contain", className)}
      />
    )
  } else if (id && load) {
    return (
      <Suspense fallback={<WalletMark size={size} className={className} />}>
        <ResolvedWalletLogo id={id} load={load} size={size} className={className} />
      </Suspense>
    )
  } else return <WalletMark size={size} className={className} />
}
