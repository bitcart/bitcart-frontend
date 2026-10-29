import { stripTrailingSlashes } from "./script-base"

export const CHECKOUT_URL_PLACEHOLDER = "__BITCART_CHECKOUT_URL__"

export const parseCheckoutUrl = (value: string): string | null => {
  try {
    const { protocol, href } = new URL(value)

    return protocol === "https:" || protocol === "http:" ? stripTrailingSlashes(href) : null
  } catch {
    return null
  }
}

export const injectedCheckoutUrl: string | null = parseCheckoutUrl(CHECKOUT_URL_PLACEHOLDER)
