import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { LocaleId } from "@bitcart/core/utils"
import { useCallback, useMemo } from "react"
import { usePageContext } from "vike-react/usePageContext"

import { getAnchorElementProps, isExternalLink, scrollToTop } from "../utils"

export type LinkProps<TSupportedLocaleId extends LocaleId> = {
  disabled?: boolean
  untracked?: boolean
  href: string
  target?: string

  /**
   * Prepended to `href`, if specified,
   * e.g. `/en/your-path` when `locale` is `en` and `href` is `/your-path`.
   */
  locale?: TSupportedLocaleId

  onClick?: (event: React.MouseEvent) => void
  title?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const Link = <TSupportedLocaleId extends LocaleId>({
  disabled: isDisabled = false,
  untracked: isUntracked = false,
  href,
  onClick,
  children,
  ...props
}: LinkProps<TSupportedLocaleId>) => {
  const { localeId: pageLocaleId } = usePageContext()

  const localizedHref = useMemo(() => {
    const localeId = props.locale ?? pageLocaleId

    if (href !== undefined && !isExternalLink(href) && localeId !== SOURCE_LOCALE_ID) {
      return `/${localeId}` + (href === "/" ? "" : href)
    } else return href
  }, [href, pageLocaleId, props.locale])

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
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
      rel={isUntracked ? "noreferrer" : undefined}
      onClick={handleClick}
      {...getAnchorElementProps(localizedHref)}
      {...props}
    >
      {children}
    </a>
  )
}
