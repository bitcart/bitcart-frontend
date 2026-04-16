import { createContext } from "react"

import type { BasicLinkComponent } from "@/types"

export const LinkComponentContext = createContext<BasicLinkComponent | null>(null)
