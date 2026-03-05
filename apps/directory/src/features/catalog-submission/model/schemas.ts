import type { FromSchema } from "@bitcart/core/types"
import { emptyAsUndefined } from "@bitcart/core/zod"
import { t } from "@lingui/core/macro"
import { discriminatedUnion, literal, object, regexes, string, url, enum as zodEnum } from "zod"

import {
  CATALOG_ENTRY_SELFCONTAINED_CATEGORY_IDS,
  CATALOG_ENTRY_SUPERCATEGORY_ID,
} from "@/entities/catalog"

import { FORM_CONFIG } from "../constants"

// FIXME: Consider relocating to the form kit or passing to `useAppForm` as an i18n dependency
const getRequiredFieldErrorMessage = () => t`This field is required`

// FIXME: Consider relocating to the form kit or passing to `useAppForm` as an i18n dependency
const getMinLengthErrorMessage = (minLength: number) =>
  t`Must be at least ${minLength} characters long`

// FIXME: Consider relocating to the form kit or passing to `useAppForm` as an i18n dependency
const getMaxLengthErrorMessage = (maxLength: number) =>
  t`Cannot be more than ${maxLength} characters long`

export const getCatalogSubmissionSchema = () => {
  const { fields: cfg } = FORM_CONFIG

  return object({
    name: string()
      .min(cfg.name.minLength, getMinLengthErrorMessage(cfg.name.minLength))
      .max(cfg.name.maxLength, getMaxLengthErrorMessage(cfg.name.maxLength)),

    description: string(getRequiredFieldErrorMessage())
      .min(cfg.description.minLength, getMinLengthErrorMessage(cfg.description.minLength))
      .max(cfg.description.maxLength, getMaxLengthErrorMessage(cfg.description.maxLength)),

    type: discriminatedUnion("category", [
      object({
        category: zodEnum(CATALOG_ENTRY_SELFCONTAINED_CATEGORY_IDS),
      }),

      object({
        category: literal(CATALOG_ENTRY_SUPERCATEGORY_ID),
        subcategory: string(getRequiredFieldErrorMessage()),
      }),
    ]),

    url: url({
      message: t`Must be a valid website URL`,
      protocol: /^https?$/,
      hostname: regexes.domain,
    }),

    twitter: emptyAsUndefined(
      string()
        .min(cfg.twitter.minLength, getMinLengthErrorMessage(cfg.twitter.minLength))
        .max(cfg.twitter.maxLength, getMaxLengthErrorMessage(cfg.twitter.maxLength))
        .regex(cfg.twitter.regex, t`Must be a valid Twitter handle`)
        .optional(),
    ),

    github: emptyAsUndefined(
      string()
        .regex(cfg.github.regex, t`Must be a valid GitHub username or repo path`)
        .optional(),
    ),
  })
}

export type CatalogSubmissionInputs = FromSchema<ReturnType<typeof getCatalogSubmissionSchema>>
