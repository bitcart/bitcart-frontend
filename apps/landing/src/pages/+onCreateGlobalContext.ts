import { BitcartApiConfig } from "@bitcart/api-sdk/config"

import { BITCART_API_URL } from "@/common/constants"

/**
 * https://vike.dev/onCreateGlobalContext
 */
export const onCreateGlobalContext = (): void => {
  BitcartApiConfig.set({ baseUrl: BITCART_API_URL })
}
