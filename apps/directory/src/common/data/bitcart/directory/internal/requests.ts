import { t } from "@lingui/core/macro"

import { CLIENT_CONFIG } from "./config"
import type { DirectoryEntry, DirectoryEntryCategory } from "./types"

export const getDirectoryCategories = (): DirectoryEntryCategory[] => [
  { id: "app", name: t`Apps` },
  { id: "host", name: t`Hosts` },

  {
    id: "merchant",
    name: t`Merchants`,

    subcategories: [
      { id: "retail", name: t`Retail` },
      { id: "services", name: t`Services` },
      { id: "food", name: t`Food & Beverage` },
      { id: "digital", name: t`Digital Products` },
      { id: "other", name: t`Other` },
    ],
  },
]

export const getDirectoryEntries = (): Promise<DirectoryEntry[]> =>
  fetch(`${CLIENT_CONFIG.baseURL}/directory.json`).then((response) => {
    if (response.ok) {
      return response.json() as unknown as DirectoryEntry[]
    } else {
      throw new Error(
        `Failed to fetch directory entries: ${response.status} ${response.statusText}`,
      )
    }
  })
