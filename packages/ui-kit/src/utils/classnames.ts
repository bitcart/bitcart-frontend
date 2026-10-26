//* Originally ported from: https://ui.shadcn.com

import { cx } from "class-variance-authority"
import type { ClassValue } from "class-variance-authority/types"
import { extendTailwindMerge } from "tailwind-merge"

//* `elevation-*` (`presetBitcart`'s shortcuts) set the box shadow, so a `shadow-*` passed after one
//* replaces it, as it would replace another `shadow-*`.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { shadow: [{ elevation: ["none", "1", "2", "3", "4"] }] } },
})

export const cn = (...inputs: ClassValue[]): string => twMerge(cx(inputs))
