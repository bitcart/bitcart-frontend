import { t } from "@lingui/core/macro"
import { AlertCircle, Home, Lock, RefreshCw, ShieldAlert } from "lucide-react"
import { useMemo } from "react"

import type { BasicLinkComponent, ErrorDisplayAttributes } from "@/types"
import { cn } from "@/utils"

import { Button } from "../atoms/button"

export type ErrorPageTemplateProps = Partial<ErrorDisplayAttributes> & {
  LinkComponent: BasicLinkComponent
  statusCode: number
  handleRetry?: VoidFunction
  className?: string
  children?: React.ReactNode
}

export const ErrorPageTemplate: React.FC<ErrorPageTemplateProps> = ({
  LinkComponent: Link,
  statusCode,
  handleRetry,
  className,
  children,
  ...props
}) => {
  const { title, icon, message }: ErrorDisplayAttributes = useMemo(() => {
    switch (statusCode) {
      case 401: {
        return {
          title: t`Authentication Required`,
          icon: props.icon ?? <Lock className="w-16 h-16 text-yellow-500" />,

          message:
            props.message ??
            t`You cannot access this page because you are not logged in. Please log in.`,
        }
      }

      case 403: {
        return {
          title: t`Access Denied`,
          icon: props.icon ?? <ShieldAlert className="w-16 h-16 text-destructive-foreground" />,
          message: props.message ?? t`You do not have permission to access this page.`,
        }
      }

      case 404: {
        return {
          title: t`Page Not Found`,
          icon: <AlertCircle className="w-16 h-16 text-orange-500" />,
          message: t`This page does not exist.`,
        }
      }

      case 500: {
        return {
          title: t`Server Error`,
          icon: props.icon ?? <AlertCircle className="w-16 h-16 text-destructive-foreground" />,
          message: props.message ?? t`Something went wrong. Try again later.`,
        }
      }

      default: {
        return {
          title: t`Error`,
          icon: props.icon ?? <AlertCircle className="w-16 h-16 text-destructive-foreground" />,
          message: props.message ?? t`Something went wrong. Try again later.`,
        }
      }
    }
  }, [props.icon, props.message, statusCode])

  return (
    <div
      className={cn("pt-16 bg-background flex min-h-screen items-center justify-center", className)}
    >
      <div className="max-w-lg px-4 md:px-6 text-center">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-secondary rounded-full">{icon}</div>
        </div>

        <div className="mb-4">
          <span className="text-6xl sm:text-7xl font-bold text-accent-foreground">
            {statusCode}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8 text-base sm:text-lg leading-relaxed">{message}</p>

        <div className="sm:flex-row gap-4 flex flex-col justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="w-5 h-5" />
              <span>{t`Go Home`}</span>
            </Link>
          </Button>

          {statusCode !== 500 && (
            <Button size="lg" variant="secondary" onClick={handleRetry}>
              <RefreshCw className="w-5 h-5" />
              <span>{t`Try Again`}</span>
            </Button>
          )}
        </div>

        {children && <div className="mt-8 pt-8 border-muted border-t">{children}</div>}
      </div>
    </div>
  )
}
