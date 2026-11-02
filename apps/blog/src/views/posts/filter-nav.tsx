import { SegmentedControl, SegmentedControlItem } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { Link as RouterLink } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

import { filterPostsByCategory, type PostSummary } from "#/common/content/posts"
import { AUTHORS, CATEGORIES, type CategoryKey } from "#/common/content/taxonomy"

import type { ListFilter } from "./list-filter"

export type FilterNavProps = {
  posts: PostSummary[]
  categories: readonly CategoryKey[]
  filter: ListFilter
  className?: string
}

//* The control highlights the link the router marks with `aria-current="page"`.
const LINK_OPTIONS = { resetScroll: false, activeOptions: { exact: true } } as const

const Count: React.FC<{ value: number }> = ({ value }) => (
  <span className="text-xs text-muted-foreground tabular-nums">{value}</span>
)

export const FilterNav: React.FC<FilterNavProps> = ({ posts, categories, filter, className }) => {
  const { t } = useLingui()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const nav = navRef.current
    const activeItem = nav?.querySelector('[aria-current="page"]')

    //* Only while the row is on screen, so the page itself never scrolls.
    if (nav && activeItem) {
      const { top, bottom } = nav.getBoundingClientRect()

      if (top >= 0 && bottom <= window.innerHeight) {
        activeItem.scrollIntoView({ block: "nearest", inline: "center" })
      }
    }
  }, [filter])

  return (
    <SegmentedControl
      render={<nav ref={navRef} aria-label={t`Filter posts`} />}
      className={className}
    >
      <SegmentedControlItem render={<RouterLink to="/" {...LINK_OPTIONS} />}>
        {t`All posts`}
        <Count value={posts.length} />
      </SegmentedControlItem>

      {categories.map((category) => (
        <SegmentedControlItem
          key={category}
          render={<RouterLink to="/category/$category" params={{ category }} {...LINK_OPTIONS} />}
        >
          {CATEGORIES[category].label}
          <Count value={filterPostsByCategory(posts, category).length} />
        </SegmentedControlItem>
      ))}

      {filter.kind === "author" && (
        <SegmentedControlItem
          render={
            <RouterLink to="/author/$author" params={{ author: filter.key }} {...LINK_OPTIONS} />
          }
        >
          {AUTHORS[filter.key].name}
        </SegmentedControlItem>
      )}
    </SegmentedControl>
  )
}
