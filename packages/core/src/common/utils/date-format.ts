/**
 * A date and time in the reader's time zone, with the month spelled out: `Sep 24, 2026, 10:06 AM`.
 */
export const formatDateTime = (isoDate: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(isoDate),
  )
