import type { FromSchema } from "@bitcart/core/types"
import { emptyAsUndefined } from "@bitcart/core/validation"
import { t } from "@lingui/core/macro"
import * as z from "zod"

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

  return z.object({
    name: z
      .string()
      .min(cfg.name.minLength, getMinLengthErrorMessage(cfg.name.minLength))
      .max(cfg.name.maxLength, getMaxLengthErrorMessage(cfg.name.maxLength)),

    description: z
      .string(getRequiredFieldErrorMessage())
      .min(cfg.description.minLength, getMinLengthErrorMessage(cfg.description.minLength))
      .max(cfg.description.maxLength, getMaxLengthErrorMessage(cfg.description.maxLength)),

    type: z.discriminatedUnion("category", [
      z.object({
        category: z.enum(CATALOG_ENTRY_SELFCONTAINED_CATEGORY_IDS),
      }),

      z.object({
        category: z.literal(CATALOG_ENTRY_SUPERCATEGORY_ID),
        subcategory: z.string(getRequiredFieldErrorMessage()),
      }),
    ]),

    url: z.url({
      error: t`Must be a valid website URL`,
      protocol: /^https?$/,
      hostname: z.regexes.domain,
    }),

    twitter: emptyAsUndefined(
      z
        .string()
        .min(cfg.twitter.minLength, getMinLengthErrorMessage(cfg.twitter.minLength))
        .max(cfg.twitter.maxLength, getMaxLengthErrorMessage(cfg.twitter.maxLength))
        .regex(cfg.twitter.regex, t`Must be a valid Twitter handle`)
        .optional(),
    ),

    github: emptyAsUndefined(
      z
        .string()
        .regex(cfg.github.regex, t`Must be a valid GitHub username or repo path`)
        .optional(),
    ),
  })
}

export type CatalogSubmissionInputs = FromSchema<ReturnType<typeof getCatalogSubmissionSchema>>
