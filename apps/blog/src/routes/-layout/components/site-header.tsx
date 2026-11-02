import { useIsClient } from "@bitcart/hooks"
import {
  ThemeToggle,
  ThemeToggleFallback,
  WebsiteHeader,
  WebsiteMobileMenu,
  WebsiteNavigationMenu,
} from "@bitcart/ui-kit/components"
import { useCurrentBreakpoint } from "@bitcart/ui-kit/hooks"

import type { PostSummary } from "#/common/content/posts"

import { SearchDialog } from "./search-dialog"

export type SiteHeaderProps = {
  posts: PostSummary[]
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ posts }) => {
  const isClient = useIsClient()
  const currentBreakpoint = useCurrentBreakpoint()

  return (
    <WebsiteHeader>
      <WebsiteNavigationMenu
        className="md:flex hidden"
        inert={isClient && currentBreakpoint === "sm"}
      />

      {isClient ? <ThemeToggle /> : <ThemeToggleFallback />}
      <SearchDialog posts={posts} />
      <WebsiteMobileMenu classNames={{ trigger: "md:hidden" }} />
    </WebsiteHeader>
  )
}
