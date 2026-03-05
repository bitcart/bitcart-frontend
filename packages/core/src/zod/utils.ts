import { isEmptyish } from "remeda"
import { preprocess, type ZodOptional, type ZodString, type ZodURL } from "zod"

export const emptyAsUndefined = (schema: ZodOptional<ZodString | ZodURL>) =>
  preprocess((value: string | undefined) => {
    if (isEmptyish(value)) {
      return undefined
    } else return value
  }, schema)
