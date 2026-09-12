# Bitcart API SDK

TypeScript SDK for the Bitcart Merchants API.

## OpenAPI schema

`openapi.json` is the pinned API surface the SDK is generated from. Pin a new one with
`just api-sync <source>`, where the source is a running backend's base URL or a path to a schema
exported by the backend's `just openapi` — including the `openapi` artifact its CI uploads.

## Mocking

`msw` and `@faker-js/faker` back the generated request handlers behind the `@bitcart/api-sdk/mocks`
entry point, and nothing else in the SDK imports them. They are declared as optional peers so that
consumers that never touch that entry point don't carry a mocking stack into their production
install closure. Install both alongside the SDK to use it:

```sh
just add-dev <ws-member> msw
just add-dev <ws-member> @faker-js/faker
```

## Architecture

### Dependency graph

![Dependency graph visualization](graphviz.svg "Dependency graph visualization")
