import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { A11yAwareLinkProps } from "@bitcart/core/types"
import {
  isLmbClick,
  type LocaleId,
  getDestinationTypeAwareLinkProps,
  isExternalHref,
} from "@bitcart/core/utils"
import { useCallback, useMemo } from "react"
import { usePageContext } from "vike-react/usePageContext"

import { scrollTo } from "../effects"

export type LinkProps<TSupportedLocaleId extends LocaleId> = A11yAwareLinkProps & {
  disabled?: boolean
  originAware?: boolean

  /**
   * Prepended to `href`, if specified,
   * e.g. `/en/your-path` when `locale` is `en` and `href` is `/your-path`.
   */
  locale?: TSupportedLocaleId

  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  title?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Link = <TSupportedLocaleId extends LocaleId>({
  a11yHint,
  disabled: isDisabled = false,
  originAware: isOriginAware = true,
  href,
  locale,
  onClick,
  children,
  ...props
}: LinkProps<TSupportedLocaleId>): React.JSX.Element => {
  const { localeId: pageLocaleId } = usePageContext()

  const localizedHref = useMemo(() => {
    const localeId = locale ?? pageLocaleId

    if (href !== undefined && !isExternalHref(href) && localeId !== SOURCE_LOCALE_ID) {
      return `/${localeId}` + (href === "/" ? "" : href)
    } else return href
  }, [href, locale, pageLocaleId])

  const anchorElementProps = {
    ...getDestinationTypeAwareLinkProps({ href: localizedHref, isOriginAware }),
    ...props,
  }

  const handleClick = useCallback<React.MouseEventHandler<HTMLAnchorElement>>(
    (event) => {
      if (!isDisabled) {
        onClick?.(event)

        if (isLmbClick(event) && localizedHref !== undefined && !isExternalHref(localizedHref)) {
          const target = new URL(localizedHref, window.location.href)

          if (target.pathname === window.location.pathname) {
            //* Vike does not fire `onPageTransitionEnd` for same-pathname
            //* clicks, so handle the smooth scroll (and URL update, if any)
            //* inline here. Cross-page clicks fall through to Vike's router
            //* and the lifecycle hook scrolls after the transition.
            event.preventDefault()

            //* Stop the bubble so Vike's document-level click listener
            //* doesn't also process this link. After our `pushState`
            //* below, the URL matches the link's `href`, which makes
            //* Vike's Firefox-bug workaround (see `initOnLinkClick.ts`
            //* in `vike`) fire a synchronous *instant* `scrollIntoView`
            //* that overrides the smooth scroll scheduled here.
            event.stopPropagation()

            if (target.href !== window.location.href) {
              window.history.pushState({}, "", localizedHref)
              window.dispatchEvent(new HashChangeEvent("hashchange"))
            }

            const targetHash = target.hash.slice(1)

            //! Deferring scroll to the next macrotask.
            //! Firefox cancels in-flight smooth scrolls if the document's scroll position
            //! changes around the same tick (e.g. the browser auto-clamping `scrollY`
            //! when the new SPA page is shorter than the previous one), so the animation
            //! collapses into an instant jump. setTimeout(0) lets that clamp happen first
            //! and the smooth scroll then runs uninterrupted.
            //
            //* See https://github.com/turbolinks/turbolinks/issues/556
            //* for the same race in another framework.
            window.setTimeout(() => {
              if (targetHash) {
                scrollTo({ selector: `#${targetHash}` })
              } else scrollTo({ direction: "top" })
            }, 0)
          }
        }
      }
    },
    [isDisabled, localizedHref, onClick],
  )

  return (
    <a href={localizedHref} onClick={handleClick} {...anchorElementProps}>
      {children}
      {a11yHint && <span className="sr-only">{a11yHint}</span>}
    </a>
  )
}
