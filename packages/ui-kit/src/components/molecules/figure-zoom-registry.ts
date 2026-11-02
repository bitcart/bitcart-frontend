import { createContext, use, useEffect, useId, useRef, useState } from "react"

//* Below this, the enlarged image would barely differ from the one on the page.
const MIN_ZOOM_SCALE = 1.2

//* How far the viewer enlarges an image past its own size: further only makes it blurrier.
export const MAX_ZOOM_UPSCALE = 2

type ZoomImageSource = {
  src?: string
  srcSet?: string
  alt?: string
  width?: number | string
  height?: number | string
}

type ZoomImage = ZoomImageSource & {
  image: HTMLImageElement
  trigger: React.RefObject<HTMLButtonElement | null>
}

export type ZoomSlide = Omit<ZoomImage, "width" | "height"> & {
  id: string
  width: number
  height: number
}

export type ZoomRegistry = Map<string, ZoomImage>

export const FigureZoomContext = createContext<ZoomRegistry | null>(null)

//! Mirrors the viewer's layout: `px-4` (`md:px-16`) beside the image, and an `h-14` bar above and
//! below it.
const getViewerStageSize = () => {
  const { clientWidth, clientHeight } = document.documentElement
  const sidePadding = matchMedia("(min-width: 48rem)").matches ? 64 : 16

  return { width: clientWidth - 2 * sidePadding, height: clientHeight - 2 * 56 }
}

//* Compares both sides, so a gallery image cropped to its frame counts as shown smaller.
const isWorthZooming = (
  image: HTMLImageElement,
  { width, height }: Pick<ZoomImageSource, "width" | "height">,
) => {
  const naturalWidth = Number(width) || image.naturalWidth
  const naturalHeight = Number(height) || image.naturalHeight

  if (naturalWidth && naturalHeight && image.clientWidth && image.clientHeight) {
    const stage = getViewerStageSize()

    const zoomedWidth = Math.min(
      naturalWidth * MAX_ZOOM_UPSCALE,
      stage.width,
      (stage.height * naturalWidth) / naturalHeight,
    )

    const zoomedHeight = (zoomedWidth * naturalHeight) / naturalWidth

    return (
      zoomedWidth >= image.clientWidth * MIN_ZOOM_SCALE ||
      zoomedHeight >= image.clientHeight * MIN_ZOOM_SCALE
    )
  } else return false
}

export const useFigureImageZoom = (
  source: ZoomImageSource,
): {
  id: string
  imageRef: React.RefObject<HTMLImageElement | null>
  triggerRef: React.RefObject<HTMLButtonElement | null>
  isZoomable: boolean
} => {
  const registry = use(FigureZoomContext)
  const id = useId()
  const imageRef = useRef<HTMLImageElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isZoomable, setIsZoomable] = useState(false)
  const { src, srcSet, alt, width, height } = source

  useEffect(() => {
    const image = imageRef.current

    if (registry && image) {
      registry.set(id, { image, trigger: triggerRef, src, srcSet, alt, width, height })

      const updateIsZoomable = () => setIsZoomable(isWorthZooming(image, { width, height }))
      const observer = new ResizeObserver(updateIsZoomable)

      observer.observe(image)
      image.addEventListener("load", updateIsZoomable)
      window.addEventListener("resize", updateIsZoomable)

      return () => {
        registry.delete(id)
        observer.disconnect()
        image.removeEventListener("load", updateIsZoomable)
        window.removeEventListener("resize", updateIsZoomable)
      }
    } else return undefined
  }, [registry, id, src, srcSet, alt, width, height])

  return { id, imageRef, triggerRef, isZoomable }
}
