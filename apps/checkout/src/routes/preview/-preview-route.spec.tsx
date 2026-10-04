import type { RuntimeEnvTag } from "@bitcart/core/types"
import { isNotFound } from "@tanstack/react-router"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { checkoutTemplates } from "#/common/checkout-templates"

import { Route } from "./$templateId"

const env = vi.hoisted(() => ({ tag: "development" as RuntimeEnvTag }))

vi.mock("#/common/constants", async (importOriginal) => ({
  ...(await importOriginal<typeof import("#/common/constants")>()),

  get ENV_TAG() {
    return env.tag
  },
}))

//* The guard reads only the path params; the router supplies the rest.
const runGuard = (templateId: string) => {
  const { beforeLoad } = Route.options

  if (typeof beforeLoad !== "function") {
    throw new Error("The preview route no longer declares its guard as a function")
  } else
    return () =>
      beforeLoad({ params: { templateId } } as unknown as Parameters<typeof beforeLoad>[0])
}

const caught = (run: () => unknown) => {
  try {
    run()
  } catch (error) {
    return error
  }
}

const parseSearch = (search: Record<string, unknown>) => {
  const { validateSearch } = Route.options

  if (!validateSearch || !("parse" in validateSearch)) {
    throw new Error("The preview route no longer validates its search with a schema")
  } else return validateSearch.parse(search) as ReturnType<typeof Route.useSearch>
}

beforeEach(() => {
  env.tag = "development"
})

describe("preview route", () => {
  test.each(checkoutTemplates.ids)("previews the %s template outside production", (id) => {
    expect(runGuard(id)).not.toThrow()
  })

  test("is not found in production", () => {
    env.tag = "production"

    expect(isNotFound(caught(runGuard(checkoutTemplates.defaultId)))).toBe(true)
  })

  test("is not found for a template that does not exist", () => {
    expect(isNotFound(caught(runGuard("no-such-template")))).toBe(true)
  })

  test.each([
    [{ status: "expired" }, "expired"],
    [{ status: "no-such-status" }, "new"],
    [{}, "new"],
  ])("reads the search %o as the %s status", (search, status) => {
    expect(parseSearch(search)).toMatchObject({ status })
  })

  test.each([
    [{ palette: "harbor" }, "harbor"],
    [{ palette: "no-such-palette" }, undefined],
    [{}, undefined],
  ])("reads the search %o as the %s palette preset", (search, palette) => {
    expect(parseSearch(search).palette).toBe(palette)
  })
})
