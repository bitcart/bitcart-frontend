import { SegmentedControl, SegmentedControlItem } from "@bitcart/ui-kit/components"
import { useState } from "react"

const FILTERS = [
  { key: "all", label: "All posts", count: 11 },
  { key: "releases", label: "Releases", count: 9 },
  { key: "announcements", label: "Announcements", count: 1 },
  { key: "plugins", label: "Plugins", count: 1 },
]

export const NavigationSegmentedControlExample: React.FC = () => {
  const [current, setCurrent] = useState("all")

  return (
    <SegmentedControl
      render={<nav aria-label="Filter posts" />}
      className="max-w-full overflow-x-auto"
    >
      {FILTERS.map((filter) => (
        <SegmentedControlItem
          key={filter.key}
          aria-current={current === filter.key ? "page" : undefined}
          render={
            <a
              href={`#${filter.key}`}
              onClick={(event) => {
                event.preventDefault()
                setCurrent(filter.key)
              }}
            />
          }
        >
          {filter.label}
          <span className="text-xs text-muted-foreground tabular-nums">{filter.count}</span>
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}
