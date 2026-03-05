export type DirectoryEntryCategoryId = "app" | "host" | "merchant"

export type DirectoryEntry = {
  id: string
  category: DirectoryEntryCategoryId
  name: string
  description: string
  url: string

  /**
   * For merchants: 'retail', 'services', 'food', 'digital', etc.
   */
  subcategory?: string

  is_sponsor?: boolean
  is_official?: boolean

  social_links?: {
    github?: string
    twitter?: string
  }
}

export type DirectoryEntrySubcategory = {
  id: string
  name: string
}

export type DirectoryEntryCategory = {
  id: string
  name: string
  subcategories?: DirectoryEntrySubcategory[]
}

export type DirectoryCatalog = {
  entries: DirectoryEntry[]

  /**
   * The total number of directory entries.
   *
   * ⚠️ Must not be altered by the consuming code.
   */
  totalCount: number
}
