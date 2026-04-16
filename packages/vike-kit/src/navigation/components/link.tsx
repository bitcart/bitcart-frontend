import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { A11yAwareLinkProps } from "@bitcart/core/types"
import type { LocaleId } from "@bitcart/core/utils"
import { useCallback, useMemo } from "react"
import { usePageContext } from "vike-react/usePageContext"

import { getAnchorElementProps, isExternalLink, scrollToTop } from "../utils"

export type LinkProps<TSupportedLocaleId extends LocaleId> = A11yAwareLinkProps & {
  disabled?: boolean
  untracked?: boolean

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
  untracked: isUntracked = false,
  href,
  locale,
  onClick,
  children,
  ...props
}: LinkProps<TSupportedLocaleId>) => {
  const { localeId: pageLocaleId } = usePageContext()

  const localizedHref = useMemo(() => {
    const localeId = locale ?? pageLocaleId

    if (href !== undefined && !isExternalLink(href) && localeId !== SOURCE_LOCALE_ID) {
      return `/${localeId}` + (href === "/" ? "" : href)
    } else return href
  }, [href, locale, pageLocaleId])

  const anchorProps = getAnchorElementProps(localizedHref, props)

  const handleClick = useCallback<React.MouseEventHandler<HTMLAnchorElement>>(
    (event) => {
      if (!isDisabled) {
        onClick?.(event)

        if (!isExternalLink(href) && !href.includes("#")) {
          scrollToTop()
        }
      }
    },

    [isDisabled, href, onClick],
  )

  return (
    <a
      href={localizedHref}
      onClick={handleClick}
      rel={isUntracked ? "noopener noreferrer" : anchorProps.rel}
      {...anchorProps}
    >
      {children}
      {a11yHint && <span className="sr-only">{a11yHint}</span>}
    </a>
  )
}
