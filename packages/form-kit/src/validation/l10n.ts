import { applyZodL10n as applyCoreZodL10n, type ZodL10nMessages } from "@bitcart/core/validation"
import { plural, t } from "@lingui/core/macro"

/**
 * Wording for Zod's built-in issues, resolved against the active Lingui catalogue.
 */
export const zodL10nMessages: ZodL10nMessages = {
  required: () => t`Required`,
  invalidType: (expected) => t`Expected ${expected}`,

  stringTooSmall: (minimum) =>
    plural(minimum, {
      one: "Must be at least # character",
      other: "Must be at least # characters",
    }),

  stringTooBig: (maximum) =>
    plural(maximum, {
      one: "Must be at most # character",
      other: "Must be at most # characters",
    }),

  collectionTooSmall: (minimum) =>
    plural(minimum, {
      one: "Must have at least # item",
      other: "Must have at least # items",
    }),

  collectionTooBig: (maximum) =>
    plural(maximum, {
      one: "Must have at most # item",
      other: "Must have at most # items",
    }),

  valueTooSmall: (minimum) => t`Must be at least ${minimum}`,
  valueTooBig: (maximum) => t`Must be at most ${maximum}`,

  invalidEmail: () => t`Must be a valid email address`,
  invalidUrl: () => t`Must be a valid URL`,
  invalidUuid: () => t`Must be a valid UUID`,
  invalidDateTime: () => t`Must be a valid date and time`,
  invalidDate: () => t`Must be a valid date`,
  invalidFormat: () => t`Invalid format`,

  invalidValue: () => t`Not one of the allowed values`,
  notMultipleOf: (divisor) => t`Must be a multiple of ${divisor}`,
  unrecognizedKey: () => t`Unrecognized field`,
}

export const applyZodL10n = (): void => {
  applyCoreZodL10n(zodL10nMessages)
}
