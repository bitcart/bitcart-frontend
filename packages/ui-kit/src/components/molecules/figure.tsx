import type { HttpHref } from "@bitcart/core/navigation"
import { useLingui } from "@lingui/react/macro"
import { Play } from "lucide-react"
import { useState } from "react"

import { cn } from "@/utils"

import { DialogTrigger } from "../atoms/dialog"
import { FIGURE_FRAME_CLASS_NAME } from "../atoms/figure-styles"
import { FigureZoom } from "./figure-zoom"
import { useFigureImageZoom } from "./figure-zoom-registry"

export type FigureProps = React.ComponentProps<"figure"> & {}

export const Figure: React.FC<FigureProps> = ({ className, ...props }) => {
  return (
    <FigureZoom>
      <figure data-slot="figure" className={cn("my-8 not-prose", className)} {...props} />
    </FigureZoom>
  )
}

export type FigureImageProps = React.ComponentProps<"img"> & {}

export const FigureImage: React.FC<FigureImageProps> = ({ className, alt, ...props }) => {
  const { t } = useLingui()
  const { id, imageRef, triggerRef, isZoomable } = useFigureImageZoom({ ...props, alt })

  return (
    <div
      data-slot="figure-image"
      className="relative mx-auto w-fit max-w-full in-[[data-slot=figure-gallery]]:w-full"
    >
      <img
        alt={alt}
        loading="lazy"
        className={cn(
          FIGURE_FRAME_CLASS_NAME,
          "block h-auto max-w-full",
          "in-[[data-slot=figure-gallery]]:aspect-[4/3] in-[[data-slot=figure-gallery]]:w-full in-[[data-slot=figure-gallery]]:object-cover in-[[data-slot=figure-gallery]]:object-top",
          className,
        )}
        {...props}
        ref={imageRef}
      />

      {isZoomable && (
        <DialogTrigger
          ref={triggerRef}
          payload={id}
          aria-label={alt ? t`Enlarge image: ${alt}` : t`Enlarge image`}
          className={cn(`
            inset-0 rounded-xl focus-visible:outline-ring
            absolute cursor-zoom-in outline-offset-2
            focus-visible:outline-3
          `)}
        />
      )}
    </div>
  )
}

export type FigureVideoEmbedProps = {
  src: HttpHref
  poster: string
  title: string
  className?: string
}

//* Add the player's autoplay parameter to `src`, or the reader has to press play twice.
export const FigureVideoEmbed: React.FC<FigureVideoEmbedProps> = ({
  src,
  poster,
  title,
  className,
}) => {
  const { t } = useLingui()
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false)

  return (
    <div
      data-slot="figure-video-embed"
      className={cn(
        FIGURE_FRAME_CLASS_NAME,
        "bg-muted aspect-video relative w-full overflow-hidden",
        className,
      )}
    >
      {isPlayerLoaded ? (
        <iframe
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="inset-0 absolute size-full"
        />
      ) : (
        <button
          type="button"
          aria-label={t`Play video: ${title}`}
          onClick={() => setIsPlayerLoaded(true)}
          className={cn(`
            group inset-0 focus-visible:outline-ring
            absolute
            size-full cursor-pointer outline-offset-[-4px]
            focus-visible:outline-3
          `)}
        >
          <img src={poster} alt="" loading="lazy" className="size-full object-cover" />

          <span
            className={cn(`
              size-16 bg-primary text-primary-foreground shadow-lg
              absolute
              top-1/2 left-1/2 flex -translate-1/2 items-center justify-center rounded-full transition-transform
              group-hover:scale-110
              motion-reduce:transition-none
            `)}
          >
            <Play aria-hidden className="size-7 ml-1 fill-current" />
          </span>
        </button>
      )}
    </div>
  )
}
