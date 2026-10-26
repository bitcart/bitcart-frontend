import { getManageSetPoliciesResponseMock } from "@bitcart/client-sdk/mocks"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, test } from "vitest"

import { setupCheckoutApiServer } from "#/checkout/testing/api-server"
import { CheckoutTestProviders } from "#/checkout/testing/checkout-harness"

import { PoweredByFooter } from "./powered-by-footer"

const server = setupCheckoutApiServer()

const renderFooter = (policies: () => Response) => {
  let requests = 0

  server.use(
    http.get("*/manage/policies", () => {
      requests += 1

      return policies()
    }),
  )

  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <CheckoutTestProviders>
        <PoweredByFooter />
      </CheckoutTestProviders>
    </QueryClientProvider>,
  )

  return { requests: () => requests }
}

const policiesAllowing = (allowed: boolean) => () =>
  HttpResponse.json(getManageSetPoliciesResponseMock({ allow_powered_by_bitcart: allowed }))

describe("PoweredByFooter", () => {
  test("credits Bitcart when the server allows it", async () => {
    renderFooter(policiesAllowing(true))

    expect(await screen.findByRole("img", { name: "Bitcart" })).toBeInTheDocument()
  })

  test.each([
    ["the server disallows it", policiesAllowing(false)],
    ["the policies can't be loaded", () => HttpResponse.json(null, { status: 500 })],
  ])("stays hidden when %s", async (_case, policies) => {
    const { requests } = renderFooter(policies)

    await waitFor(() => expect(requests()).toBe(1))

    expect(screen.queryByText("Powered by")).not.toBeInTheDocument()
  })
})
