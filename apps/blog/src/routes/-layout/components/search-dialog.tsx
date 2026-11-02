import { formatCalendarDate } from "@bitcart/core/utils"
import {
  Button,
  Command,
  CommandDialog,
  CommandDialogPopup,
  CommandEmpty,
  CommandFooter,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  Kbd,
} from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { useNavigate } from "@tanstack/react-router"
import { useStaticSearch } from "fumadocs-core/search/client"
import { SearchIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { SEARCH_INDEX_PATH } from "#/common/constants"
import type { PostSummary } from "#/common/content/posts"
import { CATEGORIES } from "#/common/content/taxonomy"
import { getPostHref } from "#/common/navigation"

//* A post matches once for its title, again for each heading and paragraph: keep its best rank.
const getMatchedPosts = (posts: PostSummary[], urls: string[]) => {
  const postsByHref = new Map<string, PostSummary>(
    posts.map((post) => [getPostHref(post.slug), post]),
  )

  const hrefs = new Set(urls.map((url) => url.split("#")[0]))

  return [...hrefs].flatMap((href) => postsByHref.get(href) ?? [])
}

export type SearchDialogProps = {
  posts: PostSummary[]
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ posts }) => {
  const { t, i18n } = useLingui()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const { search, onSearchChange, data } = useStaticSearch({ from: SEARCH_INDEX_PATH })

  const matchedPosts = useMemo(
    () =>
      search && data
        ? getMatchedPosts(
            posts,
            data.items.flatMap((item) => (item.type === "table" ? [] : [item.url])),
          )
        : posts,

    [data, posts, search],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        setIsOpen((state) => !state)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const openPost = (post: PostSummary) => {
    setIsOpen(false)
    void navigate({ to: "/$slug", params: { slug: post.slug } })
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <SearchIcon />
        <span className="max-lg:sr-only">{t`Search`}</span>
        <Kbd className="max-lg:hidden">⌘K</Kbd>
      </Button>

      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandDialogPopup>
          <Command
            items={posts}
            filteredItems={matchedPosts}
            filter={null}
            value={search}
            onValueChange={onSearchChange}
            itemToStringValue={(post) => (post as PostSummary).title}
          >
            <CommandInput placeholder={t`Search posts…`} />

            <CommandPanel>
              <CommandEmpty>{t`No posts found.`}</CommandEmpty>

              <CommandList>
                {(post: PostSummary) => (
                  <CommandItem
                    key={post.slug}
                    value={post}
                    onClick={() => openPost(post)}
                    className="gap-0.5 flex-col items-start"
                  >
                    <span className="font-medium">{post.title}</span>

                    <span className="text-xs text-muted-foreground">
                      {CATEGORIES[post.category].label} ·{" "}
                      {formatCalendarDate(new Date(post.date), i18n.locale, "medium")}
                    </span>
                  </CommandItem>
                )}
              </CommandList>
            </CommandPanel>

            <CommandFooter>
              <span>{t`Open post`}</span>
              <Kbd>Enter</Kbd>
            </CommandFooter>
          </Command>
        </CommandDialogPopup>
      </CommandDialog>
    </>
  )
}
