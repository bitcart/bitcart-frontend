import { queryOptions } from "@tanstack/react-query"

import { getPaymentMethodCatalog } from "./effects"

export const paymentMethodCatalogQuery = () =>
  queryOptions({
    queryKey: ["cryptos", "paymentMethodCatalog"] as const,
    queryFn: getPaymentMethodCatalog,
  })
