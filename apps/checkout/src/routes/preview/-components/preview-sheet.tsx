import { Link, useRouter } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import * as z from "zod"

import { getSheetFrames, type SheetFrame, type SheetSearch, type PreviewSheetAxis } from "./sheet"

//! A developer tool, never shown to customers: labels are English and not translated.

const FRAME_HEIGHT_MESSAGE = "bitcart-preview-height"

const frameHeightMessageSchema = z.object({
  type: z.literal(FRAME_HEIGHT_MESSAGE),
  height: z.number(),
})

//* The root layout's padding around a frame's content, top and bottom.
const FRAME_PADDING_PX = 32

/**
 * Wraps a sheet frame's preview and reports its height to the sheet. The preview renders after
 * the frame has loaded, and grows as it settles, so the frame reports rather than being measured.
 */
export const SheetFrameContent = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const content = ref.current

    if (!content || window.parent === window) return void null

    const observer = new ResizeObserver(() =>
      window.parent.postMessage(
        { type: FRAME_HEIGHT_MESSAGE, height: content.scrollHeight + FRAME_PADDING_PX },
        window.location.origin,
      ),
    )

    observer.observe(content)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex w-full flex-col items-center">
      {children}
    </div>
  )
}

const SheetFrameView = ({
  frame: { label, width, search },
  templateId,
}: {
  frame: SheetFrame
  templateId: string
}) => {
  const router = useRouter()
  const ref = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState<number | null>(null)

  const frameHref = router.buildLocation({
    to: "/preview/$templateId",
    params: { templateId },
    search: { ...search, sheet: undefined, sheetFrame: true },
  }).href

  useEffect(() => {
    const handleMessage = ({ source, origin, data }: MessageEvent<unknown>) => {
      const message = frameHeightMessageSchema.safeParse(data)

      if (
        message.success &&
        origin === window.location.origin &&
        source === ref.current?.contentWindow
      ) {
        setHeight(message.data.height)
      }
    }

    window.addEventListener("message", handleMessage)

    return () => window.removeEventListener("message", handleMessage)
  }, [])

  return (
    <figure className="gap-1 m-0 flex shrink-0 flex-col">
      <figcaption className="text-xs">
        <Link
          to="/preview/$templateId"
          params={{ templateId }}
          search={{ ...search, sheet: undefined }}
          className="text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          {label}
        </Link>
      </figcaption>

      <iframe
        ref={ref}
        title={label}
        src={frameHref}
        loading="lazy"
        style={{ width, height: height ?? 640 }}
        className="rounded-xl border-border bg-background border"
      />
    </figure>
  )
}

/** One live preview per value of an axis, side by side, everything else as the toolbar sets it. */
export const PreviewSheet = ({
  axis,
  templateId,
  search,
}: {
  axis: PreviewSheetAxis
  templateId: string
  search: SheetSearch
}) => (
  <div className="gap-4 pb-4 flex w-full flex-wrap items-start justify-center overflow-x-auto">
    {getSheetFrames(axis, search).map((frame) => (
      <SheetFrameView
        key={`${frame.label}:${JSON.stringify(frame.search)}`}
        frame={frame}
        templateId={templateId}
      />
    ))}
  </div>
)
