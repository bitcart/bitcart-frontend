import { createNoConsoleMessagesTest } from "@bitcart/qa/e2e"
import { test } from "@playwright/test"

import { PAGE_CATALOG } from "./constants"

test.describe("Landing: Console hygiene", () => {
  for (const { name, path } of PAGE_CATALOG) {
    test(
      `no console errors or warnings on the ${name} page`,

      createNoConsoleMessagesTest({
        path,

        //* The API deterministically returns 422 on some token endpoints (e.g. `cryptos/tokens/grs`).
        //* Those fire on every run, so a retry can't clear them; they stay ignored.
        //* Matched on the stable error messages and endpoint URL.
        // FIXME:
        //! Remove once the API stops 422-ing.
        ignore: [/Failed to fetch supported (tokens|blockchains)/, /\/cryptos\//],
      }),
    )
  }
})
