import { describe, expect, test } from "vitest"

import { toSubmitErrors } from "./submit-errors"

const fieldNames = { email: "buyer_email", address: "shipping_address" }
const describeField = (field: string) => `Check the ${field}`

describe("toSubmitErrors", () => {
  test("puts a message on each form field the server rejected", () => {
    expect(
      toSubmitErrors({
        rejected: ["buyer_email", "shipping_address"],
        fieldNames,
        describe: describeField,
        fallback: "Couldn't save",
      }),
    ).toStrictEqual({
      fields: {
        email: { message: "Check the email" },
        address: { message: "Check the address" },
      },
    })
  })

  test("falls back to a form error when the rejection names none of the form's fields", () => {
    expect(
      toSubmitErrors({
        rejected: ["notes"],
        fieldNames,
        describe: describeField,
        fallback: "Couldn't save",
      }),
    ).toStrictEqual({ form: "Couldn't save", fields: {} })
  })

  test("falls back to a form error when the server named no field", () => {
    expect(
      toSubmitErrors({
        rejected: [],
        fieldNames,
        describe: describeField,
        fallback: "Couldn't save",
      }),
    ).toStrictEqual({ form: "Couldn't save", fields: {} })
  })
})
