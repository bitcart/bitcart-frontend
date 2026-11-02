import { z } from "zod"

import { AUTHOR_KEYS, CATEGORY_KEYS } from "./taxonomy.ts"

//* Search engines cut longer descriptions short.
const MAX_DESCRIPTION_LENGTH = 160

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  date: z.iso.date(),
  updated: z.iso.date().optional(),
  author: z.enum(AUTHOR_KEYS),
  category: z.enum(CATEGORY_KEYS),

  image: z.object({
    src: z.string().regex(/^\/media\/.+\.(?:png|jpe?g|webp)$/),
    alt: z.string().min(1),
  }),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>
