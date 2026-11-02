/**
 * A date and time in the reader's time zone, with the month spelled out: `Sep 24, 2026, 10:06 AM`.
 */
export const formatDateTime = (isoDate: string, locale: string): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(isoDate),
  )

//* For dates stored as UTC midnight, such as YAML's `2021-09-21`: same day in every time zone.
export const formatCalendarDate = (
  date: Date,
  locale: string,
  dateStyle: "long" | "medium" = "long",
): string => new Intl.DateTimeFormat(locale, { dateStyle, timeZone: "UTC" }).format(date)
