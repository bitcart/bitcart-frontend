import { isEmptyish } from "remeda"
import { pipe, string, type ZodOptional, type ZodString, type ZodType, type ZodURL } from "zod"

/**
 * Return type widened to the ZodType boundary: `isolatedDeclarations` can't infer the ZodPipe,
 * and the precise pipe generic is brittle across zod versions.
 * Output is always `string | undefined` for an optional string/url schema,
 * so consumers lose nothing.
 */
export type EmptyAsUndefinedZodType = ZodType<string | undefined, string | undefined>

export const emptyAsUndefined = <T extends ZodOptional<ZodString | ZodURL>>(
  schema: T,
): EmptyAsUndefinedZodType =>
  pipe(
    string()
      .optional()
      .transform((value) => {
        if (isEmptyish(value)) {
          return undefined
        } else return value
      }),
    schema,
  )
