import { z } from "zod"

export type ZodL10nMessages = {
  required: () => string
  invalidType: (expected: string) => string

  stringTooSmall: (minimum: number) => string
  stringTooBig: (maximum: number) => string
  collectionTooSmall: (minimum: number) => string
  collectionTooBig: (maximum: number) => string
  valueTooSmall: (minimum: number) => string
  valueTooBig: (maximum: number) => string

  invalidEmail: () => string
  invalidUrl: () => string
  invalidUuid: () => string
  invalidDateTime: () => string
  invalidDate: () => string
  invalidFormat: () => string

  invalidValue: () => string
  notMultipleOf: (divisor: number) => string
  unrecognizedKey: () => string
}

export const createZodErrorMap =
  (messages: ZodL10nMessages): z.core.$ZodErrorMap<z.core.$ZodIssue> =>
  (issue) => {
    switch (issue.code) {
      case "invalid_type": {
        return issue.input === undefined
          ? messages.required()
          : messages.invalidType(issue.expected)
      }

      case "too_small": {
        const minimum = Number(issue.minimum)

        if (issue.origin === "string") {
          return messages.stringTooSmall(minimum)
        }

        if (issue.origin === "array" || issue.origin === "set") {
          return messages.collectionTooSmall(minimum)
        }

        return messages.valueTooSmall(minimum)
      }

      case "too_big": {
        const maximum = Number(issue.maximum)

        if (issue.origin === "string") {
          return messages.stringTooBig(maximum)
        }

        if (issue.origin === "array" || issue.origin === "set") {
          return messages.collectionTooBig(maximum)
        }

        return messages.valueTooBig(maximum)
      }

      case "invalid_format": {
        switch (issue.format) {
          case "email": {
            return messages.invalidEmail()
          }

          case "url": {
            return messages.invalidUrl()
          }

          case "uuid": {
            return messages.invalidUuid()
          }

          case "datetime": {
            return messages.invalidDateTime()
          }

          case "date": {
            return messages.invalidDate()
          }

          default: {
            return messages.invalidFormat()
          }
        }
      }

      case "invalid_value": {
        return messages.invalidValue()
      }

      case "not_multiple_of": {
        return messages.notMultipleOf(Number(issue.divisor))
      }

      case "unrecognized_keys": {
        return messages.unrecognizedKey()
      }

      default: {
        return undefined
      }
    }
  }

/**
 * Routes Zod's default messages through the given messages.
 */
export const applyZodL10n = (messages: ZodL10nMessages): void => {
  z.config({ localeError: createZodErrorMap(messages) })
}
