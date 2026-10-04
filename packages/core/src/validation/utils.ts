import { isEmptyish } from "remeda"
import * as z from "zod"

/**
 * Return type widened to the ZodType boundary: `isolatedDeclarations` can't infer the ZodPipe,
 * and the precise pipe generic is brittle across zod versions.
 * Output is always `string | undefined` for an optional string or string format schema,
 * so consumers lose nothing.
 */
export type EmptyAsUndefinedZodType = z.ZodType<string | undefined, string | undefined>

export const emptyAsUndefined = <T extends z.ZodOptional<z.ZodString | z.ZodStringFormat>>(
  schema: T,
): EmptyAsUndefinedZodType =>
  z.pipe(
    z
      .string()
      .optional()
      .transform((value) => {
        if (isEmptyish(value)) {
          return undefined
        } else return value
      }),
    schema,
  )
