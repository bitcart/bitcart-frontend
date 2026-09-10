/**
 * Builds the `fetcher` that authenticated operations accept.
 *
 * Auth is threaded per call rather than configured globally on purpose: the token is
 * request-scoped, and a module-level header or a patched global `fetch` would leak one user's
 * token across concurrent SSR requests. Public endpoints simply omit the fetcher, which keeps
 * unauthenticated requests free of an `Authorization` header and the CORS preflight it triggers.
 */
export const createAuthenticatedFetch =
  (getToken: () => string | undefined): typeof globalThis.fetch =>
  (input, init) => {
    const token = getToken()

    if (!token) return fetch(input, init)

    const headers = new Headers(init?.headers)

    headers.set("Authorization", `Bearer ${token}`)

    return fetch(input, { ...init, headers })
  }
