export type StringToTuple<S extends string> = S extends `${infer Char}${infer Rest}`
  ? [Char, ...StringToTuple<Rest>]
  : []

export type StringLength<S extends string> = StringToTuple<S>["length"]

export type isLimitedLengthString<S extends string, N extends number> =
  StringLength<S> extends N ? true : false

/**
 * Collapses trailing whitespaces into a single space.
 */
export const squashWhitespace = (value: string): string => value.replace(/\s+/g, " ")

export const normalizeSearchTerm = (value: string): string =>
  squashWhitespace(value).trim().toLocaleLowerCase()

export const getInitials = (name: string): string => {
  const [first = "", ...rest] = name.trim().split(/\s+/)
  const last = rest.at(-1)
  const second = last ? Array.from(last)[0] : first.slice(1).match(/\p{Lu}/u)?.[0]

  return `${Array.from(first)[0] ?? ""}${second ?? ""}`.toLocaleUpperCase()
}
