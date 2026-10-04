import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { cn } from "@bitcart/ui-kit/utils"

import { useCheckout } from "../hooks"

//! Backdrop colors ignore the theme and the merchant palette: each one reproduces the neutral
//! background of the logo's original mode.
const BACKDROP_CLASS_NAMES = {
  light: "bg-white",
  dark: "bg-neutral-900",
}

export const StoreLogo = ({ className }: { className?: string }) => {
  const { branding, store } = useCheckout()
  const { logo } = branding

  if (!logo) {
    return (
      <BitcartWordmarkIcon
        role="img"
        aria-label="Bitcart"
        className={cn("h-8 w-auto", className)}
      />
    )
  } else {
    return logo.backdrop ? (
      <span
        data-logo-backdrop={logo.backdrop}
        className={cn(
          "h-8 rounded-md px-2 py-1 inline-flex",
          BACKDROP_CLASS_NAMES[logo.backdrop],
          className,
        )}
      >
        <img src={logo.url} alt={store.name} className="h-full w-auto" />
      </span>
    ) : (
      <img src={logo.url} alt={store.name} className={cn("h-8 w-auto", className)} />
    )
  }
}
