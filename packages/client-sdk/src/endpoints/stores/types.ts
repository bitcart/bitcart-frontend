import type { PublicStoreOutput } from "#/schemas"

/**
 * `GET /stores/{id}` returns the full store to an authenticated owner and this trimmed shape to
 * everyone else. Checkout is always the latter.
 */
export type Store = PublicStoreOutput

export type StoreCheckoutSettings = Store["checkout_settings"]
