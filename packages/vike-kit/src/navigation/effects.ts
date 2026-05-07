export type ScrollToArgs = { behavior?: ScrollBehavior } & (
  | { direction: "top" | "left" }
  | { selector: string }
)

/**
 * Smooth-scrolls (by default) either the window in a given direction or to the
 * first element matching `selector`. When given a selector and the element
 * isn't in the DOM yet (e.g. Vike is still rendering the destination page
 * after a cross-URL navigation), retries on each animation frame for up to
 * ~500ms before giving up.
 */
export const scrollTo = ({ behavior = "smooth", ...args }: ScrollToArgs) => {
  let retriesLeft = 30

  const tryScroll = () => {
    if ("direction" in args) {
      window.scrollTo({ [args.direction]: 0, behavior })
    } else {
      const element = document.querySelector(args.selector)

      if (element) {
        element.scrollIntoView({ behavior })
      } else if (retriesLeft > 0) {
        retriesLeft--

        window.requestAnimationFrame(tryScroll)
      }
    }
  }

  tryScroll()
}
