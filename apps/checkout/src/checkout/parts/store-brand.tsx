import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { cn } from "@bitcart/ui-kit/utils"

import { useCheckout } from "../hooks"
import type { CheckoutLogo } from "../model"

//! Backdrop colors ignore the theme and the merchant palette: each one reproduces the neutral
//! background of the image's original mode.
const BACKDROP_CLASS_NAMES = {
  light: "bg-white",
  dark: "bg-neutral-900",
}

export const StoreImage = ({
  image,
  alt,
  className,
}: {
  image: CheckoutLogo
  alt: string
  className?: string
}) =>
  image.backdrop ? (
    <span
      data-logo-backdrop={image.backdrop}
      className={cn(
        "rounded-md px-2 py-1 inline-flex justify-center",
        BACKDROP_CLASS_NAMES[image.backdrop],
        className,
      )}
    >
      <img src={image.url} alt={alt} className="min-w-0 h-full w-auto max-w-full object-contain" />
    </span>
  ) : (
    <img src={image.url} alt={alt} className={cn("object-contain", className)} />
  )

const BRAND_SIZES = {
  default: {
    image: "h-8",
    icon: "size-8 rounded-lg",
    gap: "gap-2.5",
    name: "font-bold tracking-tight leading-snug text-[15px] wrap-break-word",
  },

  sm: {
    image: "h-6",
    icon: "size-6 rounded-md",
    gap: "gap-2",
    name: "text-sm font-medium truncate",
  },
}

export const StoreBrand = ({
  size = "default",
  className,
}: {
  size?: keyof typeof BRAND_SIZES
  className?: string
}) => {
  const { branding, store } = useCheckout()
  const { brand } = branding
  const sizes = BRAND_SIZES[size]

  if (brand.kind === "icon") {
    return (
      <div className={cn("min-w-0 flex items-center", sizes.gap, className)}>
        <StoreImage
          image={brand.icon}
          alt=""
          className={cn("shrink-0", sizes.icon, brand.icon.backdrop && "p-1")}
        />

        <span className={cn("min-w-0", sizes.name)}>{store.name}</span>
      </div>
    )
  } else if (brand.kind === "logo") {
    return (
      <StoreImage
        image={brand.logo}
        alt={store.name}
        className={cn("min-w-0 w-auto max-w-full", sizes.image, className)}
      />
    )
  } else return <BitcartWordmarkIcon className={cn("w-auto shrink", sizes.image, className)} />
}
