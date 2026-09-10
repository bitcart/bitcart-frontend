import { CreateInvoice } from "@bitcart/api-sdk/schemas"
import { act, renderHook } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { useAppForm } from "./form"

describe("useAppForm with a generated API schema", () => {
  const renderInvoiceForm = (defaultValues: Partial<CreateInvoice>) =>
    renderHook(() =>
      useAppForm({
        defaultValues,
        validators: { onSubmit: CreateInvoice },
      }),
    )

  const submitErrors = async (defaultValues: Partial<CreateInvoice>) => {
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

  test("enforces the pattern the schema declares for a field", async () => {
    const { isValid, fields } = await submitErrors({ store_id: "store-1", price: "not-a-number" })

    expect(isValid).toBe(false)
    expect(fields).toContain("price")
  })

  test("accepts a payload that satisfies the schema, leaving defaulted fields alone", async () => {
    const { isValid, fields } = await submitErrors({ store_id: "store-1", price: "10.00" })

    expect(isValid).toBe(true)
    expect(fields).toHaveLength(0)
  })
})
