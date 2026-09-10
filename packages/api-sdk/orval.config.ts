import { defineConfig } from "orval"

export default defineConfig({
  bitcart: {
    input: {
      target: "./openapi.json",

      override: {
        transformer: "./scripts/transform-spec.ts",
      },
    },

    output: {
      baseUrl: {
        imports: [{ name: "BitcartApiConfig", importPath: "../../../config" }],
        runtime: "BitcartApiConfig.baseUrl",
      },

      clean: true,
      client: "react-query",
      formatter: "oxfmt",
      httpClient: "fetch",
      indexFiles: true,

      mock: {
        indexMockFiles: true,
        generators: [{ type: "msw" }],
        path: "./src/mocks/generated",
      },

      mode: "tags",

      schemas: {
        path: "./src/schemas/generated",
        splitByTags: true,
        type: "zod",
      },

      tagsSplitDeduplication: true,
      target: "./src/endpoints/_internal/generated",

      override: {
        fetch: {
          //* Without this a 404 resolves as `{ data, status }`, which TanStack Query caches
          //* as a successful result. Throws `Error & { info, status }` instead.
          forceSuccessResponse: true,

          runtimeValidation: true,

          //* Adds an optional `fetcher` to every operation, which is how authenticated apps
          //* inject a token-bearing fetch.
          useRuntimeFetcher: true,
        },

        //* `useQuery`/`useMutation` are deliberately left unset: setting either explicitly
        //* applies it to every verb, and mutations win for GET, which would route reads
        //* through mutation hooks and suppress suspense entirely.
        query: {
          runtimeValidation: true,
          useSuspenseQuery: true,
        },

        zod: {
          generateReusableSchemas: true,
          variant: "classic",
          version: 4,
        },
      },
    },
  },
})
