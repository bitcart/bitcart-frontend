import { describe, expect, test } from "vitest"

import { getRejectedFieldNames } from "./errors"

const failure = (status: number, info: unknown) =>
  Object.assign(new Error("failed"), { status, info })

describe("getRejectedFieldNames", () => {
  test("names each body field a 422 rejected once, however many issues it has", () => {
    const error = failure(422, {
      detail: [
        {
          loc: ["body", "buyer_email", "function-after[_validate(), str]"],
          msg: "…",
          type: "value_error",
        },
        { loc: ["body", "buyer_email", "literal['']"], msg: "…", type: "literal_error" },
        { loc: ["body", "shipping_address"], msg: "…", type: "string_type" },
      ],
    })

    expect(getRejectedFieldNames(error)).toStrictEqual(["buyer_email", "shipping_address"])
  })

  test("names no field for an issue about the whole body", () => {
    const error = failure(422, { detail: [{ loc: ["body"], msg: "…", type: "missing" }] })

    expect(getRejectedFieldNames(error)).toStrictEqual([])
  })

  test("names no field for a failure other than a 422", () => {
    expect(getRejectedFieldNames(failure(500, "Internal Server Error"))).toStrictEqual([])
    expect(getRejectedFieldNames(new Error("Network down"))).toStrictEqual([])
  })
})
