import { useSuspenseQuery } from "@tanstack/react-query"

import {
  getAssetCatalog,
  getBlockchainCatalog,
  getFungibleTokenCatalog,
  type GetBlockchainCatalogParams,
  type GetFungibleTokenCatalogParams,
} from "./client"

export const useAssetCatalog = () =>
  useSuspenseQuery({
    queryKey: ["useAssetCatalog"],
    queryFn: getAssetCatalog,
  })

export type UseBlockchainCatalogParams = GetBlockchainCatalogParams & {}

export const useBlockchainCatalog = (params?: UseBlockchainCatalogParams) =>
  useSuspenseQuery({
    queryKey: ["useBlockchainCatalog", params],

    queryFn: ({ queryKey: [_, queryParams] }) =>
      getBlockchainCatalog(typeof queryParams === "object" ? queryParams : undefined),
  })

export type UseFungibleTokenCatalogParams = GetFungibleTokenCatalogParams & {}

export const useFungibleTokenCatalog = (params: UseFungibleTokenCatalogParams) =>
  useSuspenseQuery({
    queryKey: ["useFungibleTokenCatalog", params],

    queryFn: ({ queryKey: [_, queryParams] }) =>
      getFungibleTokenCatalog(queryParams as UseFungibleTokenCatalogParams),
  })
