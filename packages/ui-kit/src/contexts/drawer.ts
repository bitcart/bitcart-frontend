//* Ported from: https://coss.com/ui

import { createContext } from "react"

import type { DrawerPosition } from "@/types"

export const DrawerContext: React.Context<{ position: DrawerPosition }> = createContext<{
  position: DrawerPosition
}>({
  position: "bottom",
})
