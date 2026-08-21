import {
  getDestinationTypeAwareLinkProps,
  isInternalHref,
  type InternalHref,
} from "@bitcart/core/navigation"
import type { BasicLinkComponent } from "@bitcart/ui-kit/types"
import { Link as RouterLink } from "@tanstack/react-router"

/**
 * Splits an app-internal href into the `to` / `search` / `hash` triple.
 */
const toRouterLinkOptions = (href: InternalHref) => {
  const [pathWithSearch = "", hash] = href.split("#")
  const [pathname, searchStr] = pathWithSearch.split("?")

  return {
    to: pathname || ".",
    ...(searchStr ? { search: () => Object.fromEntries(new URLSearchParams(searchStr)) } : {}),
    ...(hash ? { hash } : {}),
  }
}

/**
 * The UI Kit's `LinkComponent` binding for TanStack Router.
 *
 * Internal destinations go through the router, external ones fall back to a plain anchor.
 */
export const Link: BasicLinkComponent = ({ href, a11yHint, children, ...props }) => {
  const hint = a11yHint && <span className="sr-only">{a11yHint}</span>

  if (isInternalHref(href)) {
    return (
      <RouterLink {...toRouterLinkOptions(href)} {...props}>
        {children}
        {hint}
      </RouterLink>
    )
  } else {
    return (
      <a href={href} {...getDestinationTypeAwareLinkProps({ href })} {...props}>
        {children}
        {hint}
      </a>
    )
  }
}
