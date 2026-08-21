import { BITCART_API_URL } from "#/common/constants"

import type { Invoice, Store } from "./types"

export async function getInvoice(id: string): Promise<Invoice> {
  const response = await fetch(`${BITCART_API_URL}/invoices/${id}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch invoice: ${response.statusText}`)
  }

  return response.json()
}

export async function getStore(storeId: string): Promise<Store> {
  const response = await fetch(`${BITCART_API_URL}/stores/${storeId}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch store: ${response.statusText}`)
  }

  return response.json()
}
