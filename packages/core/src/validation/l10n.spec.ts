import { describe, expect, test } from "vitest"
import * as z from "zod"

import { createZodErrorMap, type ZodL10nMessages } from "./l10n"

const messages = new Proxy({} as ZodL10nMessages, {
  get: (_target, key) => () => String(key),
})

const firstMessage = (schema: z.ZodType, value: unknown) =>
  schema.safeParse(value, { error: createZodErrorMap(messages) }).error?.issues[0]?.message

describe("createZodErrorMap", () => {
  test.each([
    ["invalid_union", z.union([z.string(), z.number()]), true],
    ["invalid_key", z.record(z.string().min(2), z.string()), { a: "value" }],
    ["invalid_element", z.map(z.object({}), z.string().min(2)), new Map([[{}, "a"]])],
    ["custom", z.string().refine(() => false), "value"],
  ] as const)("words a %s issue as an invalid input", (_code, schema, value) => {
    expect(firstMessage(schema, value)).toBe("invalidInput")
  })
})
