import { describe, expect, test } from "vitest"
import { z } from "zod"

import { toViteEnvConfig } from "./define"
import type { EnvConfig } from "./types"

const CONFIG: EnvConfig = {
  clientEnvSchemas: {
    BITCART_ENABLED: z.stringbool().default(false),
    BITCART_ENDPOINT: z.url().optional(),
  },

  sharedEnvSchemas: { PRODUCTION_BASE_URL: z.string() },
}

describe("toViteEnvConfig", () => {
  test("serializes client-side and shared variables under `import.meta.env`", () => {
    expect(
      toViteEnvConfig(CONFIG, {
        BITCART_ENABLED: true,
        BITCART_ENDPOINT: "https://example.com",
        PRODUCTION_BASE_URL: "https://bitcart.ai",
      }),
    ).toStrictEqual({
      "import.meta.env.BITCART_ENABLED": "true",
      "import.meta.env.BITCART_ENDPOINT": '"https://example.com"',
      "import.meta.env.PRODUCTION_BASE_URL": '"https://bitcart.ai"',
    })
  })

  test("explicitly defines a variable validated to `undefined`", () => {
    expect(toViteEnvConfig(CONFIG, { BITCART_ENABLED: false })).toMatchObject({
      "import.meta.env.BITCART_ENDPOINT": "undefined",
    })
  })

  test("drops a variable for which the config does not declare a schema", () => {
    expect(toViteEnvConfig(CONFIG, { SECRET_TOKEN: "hunter2" })).not.toHaveProperty(
      "import.meta.env.SECRET_TOKEN",
    )
  })
})
