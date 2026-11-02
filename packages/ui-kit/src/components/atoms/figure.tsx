import type { HttpHref } from "@bitcart/core/navigation"
import { useLingui } from "@lingui/react/macro"
import { ExternalLink } from "lucide-react"

import { useLayoutContext } from "@/hooks"
import { cn, getTargetBlankA11yHint } from "@/utils"

import { FIGURE_FRAME_CLASS_NAME } from "./figure-styles"

export type FigureGalleryProps = React.ComponentProps<"div"> & {}

export const FigureGallery: React.FC<FigureGalleryProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="figure-gallery"
      className={cn("gap-3 grid grid-cols-2", className)}
      {...props}
    />
  )
}

export type FigureVideoProps = React.ComponentProps<"video"> & {}

export const FigureVideo: React.FC<FigureVideoProps> = ({ className, ...props }) => {
  return (
    // oxlint-disable-next-line jsx-a11y/media-has-caption -- a video with speech gets its <track> as a child
    <video
      data-slot="figure-video"
      controls
      preload="metadata"
      className={cn(FIGURE_FRAME_CLASS_NAME, "w-full", className)}
      {...props}
    />
  )
}

export type FigureCaptionProps = React.ComponentProps<"figcaption"> & {}

export const FigureCaption: React.FC<FigureCaptionProps> = ({ className, ...props }) => {
  return (
    <figcaption
      data-slot="figure-caption"
      className={cn("mt-3 text-sm text-muted-foreground text-center text-pretty", className)}
      {...props}
    />
  )
}

export type FigureSourceProps = {
  href: HttpHref
  className?: string
  children?: React.ReactNode
}

export const FigureSource: React.FC<FigureSourceProps> = ({ href, className, children }) => {
  const { Link } = useLayoutContext()
  const { i18n } = useLingui()

  return (
    <Link
      href={href}
      a11yHint={getTargetBlankA11yHint(i18n)}
      className={cn(
        "gap-1 text-primary-text inline-flex items-center whitespace-nowrap hover:underline",
        className,
      )}
    >
      {children}
      <ExternalLink aria-hidden className="size-3" />
    </Link>
  )
}
