import { useSuspenseQuery } from "@tanstack/react-query"

import { getCatalog, type GetCatalogParams } from "./client"

export type UseCatalogParams = GetCatalogParams & {}

export const useCatalog = (params?: UseCatalogParams) =>
  useSuspenseQuery({
    queryKey: ["useCatalog", params],

    //! Caching is temporarily disabled due to hardcoded data.
    // queryFn: ({ queryKey: [_, queryParams] }) =>
    //   getCatalog(typeof queryParams === "object" ? queryParams : undefined),

    queryFn: () => getCatalog(params),
  })
