import type { InternalHref } from "@bitcart/core/navigation"

import type { AuthorKey, CategoryKey } from "./content/taxonomy"

export const getPostHref = (slug: string): InternalHref => `/${slug}`
export const getCategoryHref = (category: CategoryKey): InternalHref => `/category/${category}`
export const getAuthorHref = (author: AuthorKey): InternalHref => `/author/${author}`
