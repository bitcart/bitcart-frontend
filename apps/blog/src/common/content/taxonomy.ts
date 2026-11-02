export const AUTHOR_KEYS = ["mrnaif2018"] as const

export type AuthorKey = (typeof AUTHOR_KEYS)[number]

export type Author = {
  name: string
  bio: string
  githubUrl: `https://github.com/${string}`
  avatarSrc?: `/media/authors/${string}`
}

export const AUTHORS: Record<AuthorKey, Author> = {
  mrnaif2018: {
    name: "MrNaif2018",
    bio: "Bitcart's lead developer.",
    githubUrl: "https://github.com/MrNaif2018",
    avatarSrc: "/media/authors/mrnaif2018.png",
  },
}

export const CATEGORY_KEYS = [
  "releases",
  "announcements",
  "plugins",
  "features",
  "guides",
  "stories",
] as const

export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export type Category = {
  label: string
  description: string
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  releases: {
    label: "Releases",
    description: "What changed in each Bitcart version, and how to upgrade.",
  },

  announcements: {
    label: "Announcements",
    description: "News about the project and its community.",
  },

  plugins: {
    label: "Plugins",
    description: "Integrations that connect Bitcart to other platforms.",
  },

  features: {
    label: "Features",
    description: "A closer look at what Bitcart can do.",
  },

  guides: {
    label: "Guides",
    description: "Step-by-step instructions for running and using Bitcart.",
  },

  stories: {
    label: "Stories",
    description: "How merchants and contributors use Bitcart.",
  },
}
