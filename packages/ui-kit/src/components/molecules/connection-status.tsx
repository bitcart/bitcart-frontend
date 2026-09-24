import type { SocketConnectionHandle } from "@bitcart/core/types"
import { t } from "@lingui/core/macro"
import { Loader2Icon, RefreshCwIcon, WifiOffIcon } from "lucide-react"
import type React from "react"

import { cn } from "@/utils"

import { Button } from "../atoms/button"

type SocketConnectionStatusBannerContentProps = {
  icon: React.ReactNode
  message: string | string[]
  onRetry?: () => void
}

const SocketConnectionStatusBannerContent: React.FC<SocketConnectionStatusBannerContentProps> = ({
  icon,
  message,
  onRetry,
}) => (
  <div
    role="status"
    className={cn(`
      gap-3 px-5 py-3 border-border bg-muted/40 text-muted-foreground text-xs flex flex-wrap
      items-center justify-between border-b
    `)}
  >
    <div className="gap-4 flex flex-1 flex-col">
      {(Array.isArray(message) ? message : [message]).map((line, index) => (
        <div key={index} className="gap-2 flex items-start">
          {index === 0 && icon}
          <span>{line}</span>
        </div>
      ))}
    </div>

    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCwIcon />
        {t`Reconnect`}
      </Button>
    )}
  </div>
)

export type SocketConnectionStatusBannerProps = {
  connectionHandle: SocketConnectionHandle
}

export const SocketConnectionStatusBanner: React.FC<SocketConnectionStatusBannerProps> = ({
  connectionHandle: {
    isConnected,
    isClientOnline,
    isReconnecting,
    isReconnectLimitReached,
    reconnect,
  },
}) => {
  if (isConnected) {
    return null
  } else if (isReconnecting) {
    return (
      <SocketConnectionStatusBannerContent
        icon={<Loader2Icon className="size-3.5 animate-spin shrink-0" />}
        message={t`Connection lost, reconnecting...`}
      />
    )
  } else if (!isClientOnline) {
    const bannerMessage = [
      t`Connection lost: you are offline. Please retry once your Internet connection is restored.`,
      t`If the issue persists despite having a stable Internet connection, please contact support.`,
    ]

    return (
      <SocketConnectionStatusBannerContent
        icon={<WifiOffIcon className="size-3.5 shrink-0" />}
        message={bannerMessage}
        onRetry={reconnect}
      />
    )
  } else if (isReconnectLimitReached) {
    const bannerMessage = [
      t`Connection lost: unable to connect to the server.`,
      t`Please try reconnecting later and contact support if the issue persists.`,
    ]

    return (
      <SocketConnectionStatusBannerContent
        icon={<WifiOffIcon className="size-3.5 shrink-0" />}
        message={bannerMessage}
        onRetry={reconnect}
      />
    )
  } else return null
}
