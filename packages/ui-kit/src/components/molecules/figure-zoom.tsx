import { useLingui } from "@lingui/react/macro"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useState } from "react"

import { cn } from "@/utils"

import { Button } from "../atoms/button"
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPopup,
  DialogPortal,
  type DialogProps,
  DialogTitle,
} from "../atoms/dialog"
import {
  FigureZoomContext,
  MAX_ZOOM_UPSCALE,
  type ZoomRegistry,
  type ZoomSlide,
} from "./figure-zoom-registry"

const getSlides = (registry: ZoomRegistry): ZoomSlide[] =>
  [...registry.entries()]
    .map(([id, { width, height, ...image }]) => ({
      ...image,
      id,
      width: Number(width) || image.image.naturalWidth,
      height: Number(height) || image.image.naturalHeight,
    }))
    .toSorted((a, b) =>
      a.image.compareDocumentPosition(b.image) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )

//* The background shows the copy already loaded on the page until the larger one arrives.
const getSlideStyle = ({ image, width, height }: ZoomSlide): React.CSSProperties => ({
  width:
    width && height
      ? `min(100cqw, ${width / height} * 100cqh, ${width * MAX_ZOOM_UPSCALE}px)`
      : undefined,
  backgroundImage: image.currentSrc ? `url(${JSON.stringify(image.currentSrc)})` : undefined,
})

type FigureZoomViewerProps = {
  registry: ZoomRegistry
  openedId: string
}

const FigureZoomViewer: React.FC<FigureZoomViewerProps> = ({ registry, openedId }) => {
  const { t } = useLingui()
  const [slides] = useState(() => getSlides(registry))

  const [index, setIndex] = useState(() =>
    Math.max(
      slides.findIndex(({ id }) => id === openedId),
      0,
    ),
  )

  const slide = slides.at(index)
  const count = slides.length
  const position = index + 1
  const showSlide = (nextIndex: number) => setIndex(Math.min(Math.max(nextIndex, 0), count - 1))

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      showSlide(index - 1)
    } else if (event.key === "ArrowRight") showSlide(index + 1)
  }

  //* The popup lets clicks through to the overlay, which closes the viewer.
  //! `getViewerStageSize` mirrors the stage's padding and the bars around it.
  return (
    <DialogPortal>
      <DialogOverlay className="bg-background fixed" />

      <DialogPopup
        finalFocus={() => slide?.trigger.current ?? true}
        onKeyDown={handleKeyDown}
        className={cn(`
          inset-0 data-open:animate-in
          data-open:fade-in-0 motion-safe:data-open:zoom-in-95 data-closed:animate-out
          data-closed:fade-out-0 motion-safe:data-closed:zoom-out-95 pointer-events-none
          fixed
          z-50 flex flex-col duration-200 outline-none
        `)}
      >
        <DialogTitle className="sr-only">{slide?.alt || t`Image`}</DialogTitle>

        <div className="h-14 px-2 pointer-events-auto flex shrink-0 items-center justify-end">
          <DialogClose render={<Button size="icon" variant="ghost" />} aria-label={t`Close`}>
            <X aria-hidden />
          </DialogClose>
        </div>

        <div className="px-4 md:px-16 min-h-0 [container-type:size] flex flex-1 items-center justify-center">
          {slide && (
            <img
              key={slide.id}
              src={slide.src}
              srcSet={slide.srcSet}
              sizes="100vw"
              alt={slide.alt}
              width={slide.width || undefined}
              height={slide.height || undefined}
              style={getSlideStyle(slide)}
              className="rounded-lg shadow-lg pointer-events-auto h-auto max-h-full max-w-full bg-cover"
            />
          )}
        </div>

        {count > 1 ? (
          <div className="h-14 gap-4 pointer-events-auto flex shrink-0 items-center justify-center">
            <Button
              size="icon"
              variant="ghost"
              aria-label={t`Previous image`}
              disabled={index === 0}
              onClick={() => showSlide(index - 1)}
            >
              <ChevronLeft aria-hidden />
            </Button>

            <p aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
              {t`${position} of ${count}`}
            </p>

            <Button
              size="icon"
              variant="ghost"
              aria-label={t`Next image`}
              disabled={index === count - 1}
              onClick={() => showSlide(index + 1)}
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        ) : (
          <div className="h-14 shrink-0" />
        )}
      </DialogPopup>
    </DialogPortal>
  )
}

export const FigureZoom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registry] = useState<ZoomRegistry>(() => new Map())

  //* Keys the viewer, so each opening starts at the image that opened it.
  const [openCount, setOpenCount] = useState(0)

  const handleOpenChange: DialogProps["onOpenChange"] = (open) => {
    if (open) setOpenCount((count) => count + 1)
  }

  return (
    <FigureZoomContext value={registry}>
      <Dialog onOpenChange={handleOpenChange}>
        {({ payload }) => (
          <>
            {children}

            {typeof payload === "string" && (
              <FigureZoomViewer key={openCount} registry={registry} openedId={payload} />
            )}
          </>
        )}
      </Dialog>
    </FigureZoomContext>
  )
}
