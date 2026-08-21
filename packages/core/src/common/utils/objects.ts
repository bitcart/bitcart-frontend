import { entries, isDefined } from "remeda"

export const definedEntries = (contents: Record<string, string | undefined>): [string, string][] =>
  entries(contents).filter((entry): entry is [string, string] => isDefined(entry[1]))
