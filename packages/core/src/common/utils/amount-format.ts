import { getDecimalPlaces } from "./decimals"

type FractionDigits = Pick<
  Intl.NumberFormatOptions,
  "minimumFractionDigits" | "maximumFractionDigits"
>

const INTL_CURRENCIES = new Set(Intl.supportedValuesOf("currency"))

const exactDigits = (amount: string): FractionDigits => ({
  minimumFractionDigits: getDecimalPlaces(amount),
  maximumFractionDigits: getDecimalPlaces(amount),
})

const formatNumber = (amount: string, locale: string, options: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(locale, options).format(amount as Intl.StringNumericLiteral)

const formatInCurrency = (
  amount: string,
  currency: string,
  digits: FractionDigits,
  locale: string,
): string =>
  INTL_CURRENCIES.has(currency)
    ? formatNumber(amount, locale, {
        style: "currency",
        currency,
        currencyDisplay: "symbol",
        ...digits,
      })
    : `${formatNumber(amount, locale, digits)} ${currency}`

/**
 * The UI language, with the region of the first browser locale in that language: `de-CH` for a
 * German UI in a Swiss browser.
 */
export const resolveFormattingLocale = (
  uiLocale: string,
  browserLocales: readonly string[],
): string => {
  const { language } = new Intl.Locale(uiLocale)

  return browserLocales.find((locale) => new Intl.Locale(locale).language === language) ?? uiLocale
}

export const formatDecimalAmount = (amount: string, locale: string): string =>
  formatNumber(amount, locale, exactDigits(amount))

export const formatCryptoAmount = (amount: string, symbol: string, locale: string): string =>
  `${formatDecimalAmount(amount, locale)} ${symbol.toUpperCase()}`

export const formatFiatAmount = (amount: string, currency: string, locale: string): string =>
  formatInCurrency(amount, currency, exactDigits(amount), locale)

/**
 * Rounded half-up to the currency's decimals, or more to keep three significant digits:
 * `66,666.67`, `0.004` or `0.00412`.
 */
export const formatRate = (
  rate: string,
  currency: string,
  currencyDecimals: number,
  locale: string,
): string => {
  const magnitude = Math.floor(Math.log10(Number(rate)))
  const significantDecimals = Number.isFinite(magnitude) ? 2 - magnitude : 0

  return formatInCurrency(
    rate,
    currency,
    {
      minimumFractionDigits: currencyDecimals,
      maximumFractionDigits: Math.max(currencyDecimals, significantDecimals),
    },
    locale,
  )
}
