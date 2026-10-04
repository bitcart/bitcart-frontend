import { act, renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import * as z from "zod"

import { useAppForm } from "./form"

//* Reproduces the constructs emitted by an OpenAPI schema generator for a request payload.
const createInvoiceSchema = z.object({
  store_id: z.string(),
  price: z.union([z.number(), z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/)]),
  order_id: z.string().default(""),
  notification_url: z.union([z.string(), z.null()]).default(""),
  buyer_email: z.union([z.email(), z.literal(""), z.null()]).default(""),
  products: z.union([z.array(z.string()), z.record(z.string(), z.int())]).prefault({}),
  expiration: z.union([z.int(), z.null()]).optional(),
})

type InvoiceCreationInputs = z.input<typeof createInvoiceSchema>

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
