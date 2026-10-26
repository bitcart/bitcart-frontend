import {
  formatCryptoAmount,
  formatDecimalAmount,
  formatFiatAmount,
  formatRate,
  getDecimalPlaces,
  resolveFormattingLocale,
} from "@bitcart/core/utils"
import { useLingui } from "@lingui/react"

import { useCheckout } from "./hooks"

export type CheckoutAmountFormat = {
  fiat: (amount: string) => string
  crypto: (amount: string, symbol: string) => string
  number: (amount: string) => string
  rate: (rate: string, symbol: string) => string
}

export const useFormattingLocale = (): string => {
  const { i18n } = useLingui()
  const browserLocales = typeof navigator === "undefined" ? [] : navigator.languages

  return resolveFormattingLocale(i18n.locale, browserLocales)
}

export const useAmountFormat = (): CheckoutAmountFormat => {
  const { price, currency } = useCheckout().invoice
  const locale = useFormattingLocale()

  return {
    fiat: (amount) => formatFiatAmount(amount, currency, locale),
    crypto: (amount, symbol) => formatCryptoAmount(amount, symbol, locale),
    number: (amount) => formatDecimalAmount(amount, locale),
    rate: (rate, symbol) =>
      `1 ${symbol.toUpperCase()} = ${formatRate(rate, currency, getDecimalPlaces(price), locale)}`,
  }
}
