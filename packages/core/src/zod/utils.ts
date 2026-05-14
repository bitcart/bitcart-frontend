import { isEmptyish } from "remeda"
import { pipe, string, type ZodOptional, type ZodString, type ZodURL } from "zod"

export const emptyAsUndefined = <T extends ZodOptional<ZodString | ZodURL>>(schema: T) =>
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
