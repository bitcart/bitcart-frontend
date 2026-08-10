import { SearchField } from "@bitcart/ui-kit/components"
import { useState } from "react"

export const DefaultSearchFieldExample: React.FC = () => {
  const [query, setQuery] = useState("")

  return (
    <SearchField
      className="w-72"
      placeholder="Search merchants…"
      value={query}
      onChange={setQuery}
    />
  )
}
