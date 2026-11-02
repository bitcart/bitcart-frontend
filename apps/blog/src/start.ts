import { createMiddleware, createStart } from "@tanstack/react-start"

import { NOT_FOUND_PAGE_PRERENDER_HEADER } from "#/common/prerender"

//! Prerendering drops non-2xx responses, so the build's not-found request gets a 200 and is written
//! to `404.html`, which the host serves with a 404 status.
const notFoundPagePrerenderMiddleware = createMiddleware().server(async ({ request, next }) => {
  const result = await next()

  if (request.headers.has(NOT_FOUND_PAGE_PRERENDER_HEADER) && result.response.status === 404) {
    const { body, headers } = result.response

    return new Response(body, { headers, status: 200 })
  } else return result
})

export const startInstance = createStart(() => ({
  requestMiddleware: [notFoundPagePrerenderMiddleware],
}))
