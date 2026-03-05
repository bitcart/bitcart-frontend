import { createContext } from "react"
import { doNothing } from "remeda"

import type { SystemThemeMode, ThemeMode } from "../types"

export interface ThemeState {
  mode: ThemeMode
  setMode: (targetTag: ThemeMode) => void
  systemMode: SystemThemeMode
  toggleMode: VoidFunction
}

const initialState: ThemeState = {
  mode: "system",
  setMode: doNothing,
  systemMode: "light",
  toggleMode: doNothing,
}

export const ThemeContext = createContext<ThemeState>(initialState)
