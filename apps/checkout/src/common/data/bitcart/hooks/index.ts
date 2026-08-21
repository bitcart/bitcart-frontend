import { useSuspenseQuery } from "@tanstack/react-query"

import { getInvoice, getStore } from "../client"

export * from "./invoice-websocket"

export const useInvoice = (id: string) =>
  useSuspenseQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id),
  })

export const useStore = (storeId: string) =>
  useSuspenseQuery({
    queryKey: ["store", storeId],
    queryFn: () => getStore(storeId),
  })
