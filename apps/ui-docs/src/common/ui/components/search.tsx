"use client"
import {
  SearchDialog as SearchDialogComponent,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from "@fumadocs/base-ui/components/dialog/search"
import { useI18n } from "@fumadocs/base-ui/contexts/i18n"
import { create } from "@orama/orama"
import { useDocsSearch } from "fumadocs-core/search/client"
import { oramaStaticClient } from "fumadocs-core/search/client/orama-static"

const initOrama = () =>
  create({
    schema: { _: "string" },

    //* https://docs.orama.com/docs/orama-js/supported-languages
    language: "english",
  })

export const SearchDialog = (props: SharedProps) => {
  const { locale } = useI18n()

  const { search, setSearch, query } = useDocsSearch({
    client: oramaStaticClient({ initOrama, locale }),
  })

  return (
    <SearchDialogComponent
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />

      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>

        <SearchDialogList items={query.data !== "empty" ? query.data : null} />
      </SearchDialogContent>
    </SearchDialogComponent>
  )
}
