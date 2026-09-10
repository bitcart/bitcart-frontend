import { plural, t } from "@lingui/core/macro"
import { z } from "zod"

/**
 * Translations for Zod's built-in issues.
 */
const localizeIssue: z.core.$ZodErrorMap<z.core.$ZodIssue> = (issue) => {
  switch (issue.code) {
    case "invalid_type": {
      return issue.input === undefined ? t`Required` : t`Expected ${issue.expected}`
    }

    case "too_small": {
      const minimum = Number(issue.minimum)

      if (issue.origin === "string") {
        return plural(minimum, {
          one: "Must be at least # character",
          other: "Must be at least # characters",
        })
      }

      if (issue.origin === "array" || issue.origin === "set") {
        return plural(minimum, {
          one: "Must have at least # item",
          other: "Must have at least # items",
        })
      }

      return t`Must be at least ${minimum}`
    }

    case "too_big": {
      const maximum = Number(issue.maximum)

      if (issue.origin === "string") {
        return plural(maximum, {
          one: "Must be at most # character",
          other: "Must be at most # characters",
        })
      }

      if (issue.origin === "array" || issue.origin === "set") {
        return plural(maximum, {
          one: "Must have at most # item",
          other: "Must have at most # items",
        })
      }

      return t`Must be at most ${maximum}`
    }

    case "invalid_format": {
      switch (issue.format) {
        case "email": {
          return t`Must be a valid email address`
        }

        case "url": {
          return t`Must be a valid URL`
        }

        case "uuid": {
          return t`Must be a valid UUID`
        }

        case "datetime": {
          return t`Must be a valid date and time`
        }

        case "date": {
          return t`Must be a valid date`
        }

        default: {
          return t`Invalid format`
        }
      }
    }

    case "invalid_value": {
      return t`Not one of the allowed values`
    }

    case "not_multiple_of": {
      return t`Must be a multiple of ${Number(issue.divisor)}`
    }

    case "unrecognized_keys": {
      return t`Unrecognized field`
    }

    default: {
      return undefined
    }
  }
}

/**
 * Routes Zod's default messages through the active Lingui catalogue.
 */
export const applyZodL10n = (): void => {
  z.config({ localeError: localizeIssue })
}
