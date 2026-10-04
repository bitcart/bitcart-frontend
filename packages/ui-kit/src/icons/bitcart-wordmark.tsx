import type { CustomIconComponent } from "@/types"
import { cn } from "@/utils"

import BitcartWordmarkSvg from "./bitcart-wordmark.svg?react"

//! The letters ignore the theme and follow the media kit's lockups: `#2f0e4f` (the SVG's own
//! `color`) on light surfaces, white on dark ones. The gradient mark is the same in both.
export const BitcartWordmarkIcon: CustomIconComponent = ({ className, ...props }) => (
  <BitcartWordmarkSvg className={cn("dark:text-white", className)} {...props} />
)
