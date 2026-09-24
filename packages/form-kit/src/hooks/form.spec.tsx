import { act, renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import * as zod from "zod"

import { useAppForm } from "./form"

//* Reproduces the constructs emitted by an OpenAPI schema generator for a request payload.
const createInvoiceSchema = zod.object({
  store_id: zod.string(),
  price: zod.union([zod.number(), zod.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/)]),
  order_id: zod.string().default(""),
  notification_url: zod.union([zod.string(), zod.null()]).default(""),
  buyer_email: zod.union([zod.email(), zod.literal(""), zod.null()]).default(""),
  products: zod.union([zod.array(zod.string()), zod.record(zod.string(), zod.int())]).prefault({}),
  expiration: zod.union([zod.int(), zod.null()]).optional(),
})

type InvoiceCreationInputs = zod.input<typeof createInvoiceSchema>

describe("useAppForm with a Zod object schema", () => {
  const renderInvoiceForm = (defaultValues: Partial<InvoiceCreationInputs>) =>
    renderHook(() =>
      useAppForm({
        defaultValues,
        validators: { onSubmit: createInvoiceSchema },
      }),
    )

  const submitErrors = async (defaultValues: Partial<InvoiceCreationInputs>) => {
    const { result } = renderInvoiceForm(defaultValues)

    await act(async () => {
      await result.current.handleSubmit()
    })

    return {
      isValid: result.current.state.isValid,
      fields: Object.keys(result.current.state.errorMap.onSubmit ?? {}),
    }
  }

  test("reports an omitted required field under that field's name", async () => {
    const { isValid, fields } = await submitErrors({ price: "10.00" })

    expect(isValid).toBe(false)
    expect(fields).toContain("store_id")
  })

  test("enforces the schema-declared field validation pattern", async () => {
    const { isValid, fields } = await submitErrors({ store_id: "store-1", price: "not-a-number" })

    expect(isValid).toBe(false)
    expect(fields).toContain("price")
  })

  test("accepts a payload that omits every defaulted field", async () => {
    const { isValid, fields } = await submitErrors({ store_id: "store-1", price: "10.00" })

    expect(isValid).toBe(true)
    expect(fields).toHaveLength(0)
  })
})
