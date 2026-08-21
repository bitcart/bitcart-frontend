import { scrollTo } from "@bitcart/core/navigation"
import type { PageContextClient } from "vike/types"

export const createOnPageTransitionEnd = (): ((pageContext: PageContextClient) => void) => {
  return function onPageTransitionEnd(pageContext: PageContextClient) {
    const hash = pageContext.urlParsed.hash

    //* Deferring scroll to the next macrotask.
    //* Firefox cancels in-flight smooth scrolls if the document's scroll position changes
    //* around the same tick (e.g. the browser auto-clamping `scrollY` when the new SPA page
    //* is shorter than the previous one), so the animation collapses into an instant jump.
    //* setTimeout(0) lets that clamp happen first and the smooth scroll then runs uninterrupted.
    //*
    //* See https://github.com/turbolinks/turbolinks/issues/556
    //* for the same race in another framework.
    window.setTimeout(() => {
      if (hash) {
        scrollTo({ selector: `#${hash}` })
      } else scrollTo({ direction: "top" })
    }, 0)
  }
}
