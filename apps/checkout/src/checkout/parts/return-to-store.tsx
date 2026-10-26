import type { HttpHref } from "@bitcart/core/navigation"
import { useCountdown } from "@bitcart/hooks"
import { Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { useEffect, useEffectEvent, useRef } from "react"

import { useFormattingLocale } from "../amount-format"
import { useCheckoutAppConfig } from "../hooks"
import { describeRemainingTime } from "../remaining-time"

export const REDIRECT_DELAY_SECONDS = 5

const navigateTo = (url: HttpHref) => window.location.assign(url)

const useStoreRedirect = () => useCheckoutAppConfig().redirect ?? navigateTo

const CountdownFill = () => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return void null

    const animation = ref.current?.animate([{ scale: "0 1" }, { scale: "1 1" }], {
      duration: REDIRECT_DELAY_SECONDS * 1000,
      easing: "linear",
      fill: "forwards",
    })

    return () => animation?.cancel()
  }, [])

  return (
    <span
      ref={ref}
      aria-hidden
      className="inset-0 bg-primary-foreground/25 absolute origin-left scale-x-0"
    />
  )
}

const Countdown = ({ url }: { url: HttpHref }) => {
  const redirect = useStoreRedirect()
  const { secondsLeft, isExpired } = useCountdown(REDIRECT_DELAY_SECONDS)
  const redirectOnExpiry = useEffectEvent(() => redirect(url))

  useEffect(() => {
    if (isExpired) redirectOnExpiry()
  }, [isExpired])

  return (
    <>
      <CountdownFill />

      <span aria-hidden className="relative tabular-nums opacity-70">
        · {secondsLeft}
      </span>
    </>
  )
}

type ReturnToStoreButtonProps = {
  url: HttpHref
  isCountingDown?: boolean
  className?: string
}

export const ReturnToStoreButton = ({
  url,
  isCountingDown = false,
  className,
}: ReturnToStoreButtonProps) => {
  const { t } = useLingui()
  const redirect = useStoreRedirect()

  return (
    <Button onClick={() => redirect(url)} className={cn("relative overflow-hidden", className)}>
      <span className="relative">{t`Return to Store`}</span>
      {isCountingDown && <Countdown url={url} />}
    </Button>
  )
}

export const RedirectAnnouncement = ({ storeName }: { storeName: string }) => {
  const { t } = useLingui()
  const delay = describeRemainingTime(REDIRECT_DELAY_SECONDS, useFormattingLocale())

  return (
    <p role="alert" className="sr-only">
      {t`Returning to ${storeName} in ${delay}. Press Escape to stay on this page.`}
    </p>
  )
}
