import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { useLingui } from "@lingui/react/macro"
import { XIcon } from "lucide-react"
import { createContext, use, useCallback, useRef } from "react"

import { useCurrentBreakpoint } from "@/hooks"
import { cn } from "@/utils"

import { Button } from "../atoms/button"
import { DialogOverlay, DialogPortal } from "../atoms/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
  type DrawerCloseProps,
  type DrawerDescriptionProps,
  type DrawerProps,
  type DrawerTitleProps,
  type DrawerTriggerProps,
} from "../atoms/drawer"
import { DrawerPanel } from "./drawer-panel"
import { DrawerPopup } from "./drawer-popup"
import { ScrollArea } from "./scroll-area"

const FOCUS_RESTORE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ")

type ResponsiveDialogContextValue = {
  isSheet: boolean
  focusRestoreIndexRef: React.RefObject<number | null>
}

//* The Drawer root provides the store read by both popups: Drawer extends Dialog upstream. It must
//* stay mounted across breakpoints to keep the dialog open through the swap and to return focus
//* to the opening trigger on close.
const ResponsiveDialogContext = createContext<ResponsiveDialogContextValue>({
  isSheet: true,
  focusRestoreIndexRef: { current: null },
})

const useIsSheet = () => use(ResponsiveDialogContext).isSheet

export type ResponsiveDialogProps = Omit<DrawerProps, "position" | "swipeDirection"> & {}

export const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({ onOpenChange, ...props }) => {
  const isSheet = useCurrentBreakpoint() === "sm"
  const focusRestoreIndexRef = useRef<number | null>(null)

  const handleOpenChange: NonNullable<ResponsiveDialogProps["onOpenChange"]> = (
    open,
    eventDetails,
  ) => {
    if (!open) {
      focusRestoreIndexRef.current = null
    }

    onOpenChange?.(open, eventDetails)
  }

  return (
    <ResponsiveDialogContext value={{ isSheet, focusRestoreIndexRef }}>
      <Drawer position="bottom" {...props} onOpenChange={handleOpenChange} />
    </ResponsiveDialogContext>
  )
}

export type ResponsiveDialogTriggerProps = DrawerTriggerProps & {}

export const ResponsiveDialogTrigger: React.FC<ResponsiveDialogTriggerProps> = (props) => (
  <DrawerTrigger data-slot="responsive-dialog-trigger" {...props} />
)

export type ResponsiveDialogCloseProps = DrawerCloseProps & {}

export const ResponsiveDialogClose: React.FC<ResponsiveDialogCloseProps> = (props) => (
  <DrawerClose data-slot="responsive-dialog-close" {...props} />
)

export type ResponsiveDialogPopupProps = Pick<
  DialogPrimitive.Popup.Props,
  "initialFocus" | "finalFocus"
> & {
  className?: string
  children?: React.ReactNode
}

type InitialFocusHandler = Exclude<
  NonNullable<ResponsiveDialogPopupProps["initialFocus"]>,
  boolean | React.RefObject<HTMLElement | null>
>

export const ResponsiveDialogPopup: React.FC<ResponsiveDialogPopupProps> = ({
  className,
  children,
  initialFocus,
  ...props
}) => {
  const { t } = useLingui()
  const { isSheet, focusRestoreIndexRef } = use(ResponsiveDialogContext)
  const popupRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const attachedIsSheetRef = useRef<boolean | null>(null)
  const hasPendingSwapFocusRef = useRef(false)

  const getRestorableElements = useCallback(() => {
    const elements = popupRef.current?.querySelectorAll<HTMLElement>(FOCUS_RESTORE_SELECTOR)

    //* The dialog form's own close button must not shift the indices recorded in the sheet form.
    return Array.from(elements ?? []).filter((element) => element !== closeButtonRef.current)
  }, [])

  const getRestoredElement = useCallback(
    () => getRestorableElements()[focusRestoreIndexRef.current ?? -1],
    [focusRestoreIndexRef, getRestorableElements],
  )

  const handlePopupFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const index = getRestorableElements().indexOf(event.target)

    focusRestoreIndexRef.current = index === -1 ? null : index
  }

  const resolveInitialFocus: InitialFocusHandler = (openType) => {
    const restoredElement = getRestoredElement()

    //* Each upstream default, replaced here: the sheet focuses its popup, the dialog does so
    //* on touch. `true` requests the default target, while `undefined` suppresses the focus move.
    if (hasPendingSwapFocusRef.current) {
      hasPendingSwapFocusRef.current = false

      return false
    } else if (restoredElement) {
      return restoredElement
    } else if (isSheet || openType === "touch") {
      return popupRef.current
    } else return true
  }

  const setPopupElement = useCallback(
    (element: HTMLDivElement | null) => {
      const swappedForm =
        element !== null &&
        attachedIsSheetRef.current !== null &&
        attachedIsSheetRef.current !== isSheet

      popupRef.current = element

      if (element) attachedIsSheetRef.current = isSheet

      const restoredElement = swappedForm ? getRestoredElement() : undefined

      if (restoredElement) {
        hasPendingSwapFocusRef.current = true

        queueMicrotask(() => restoredElement.focus({ preventScroll: false }))
      }
    },

    [getRestoredElement, isSheet],
  )

  if (isSheet) {
    return (
      <DrawerPopup
        ref={setPopupElement}
        data-slot="responsive-dialog-popup"
        className={className}
        initialFocus={initialFocus ?? resolveInitialFocus}
        onFocus={handlePopupFocus}
        {...props}
      >
        {children}
      </DrawerPopup>
    )
  } else
    return (
      <DialogPortal>
        <DialogOverlay className="fixed" />

        <DialogPrimitive.Popup
          ref={setPopupElement}
          data-slot="responsive-dialog-popup"
          initialFocus={initialFocus ?? resolveInitialFocus}
          onFocus={handlePopupFocus}
          className={cn(
            `
              bg-popover text-popover-foreground
              data-closed:fade-out-0
              data-open:fade-in-0
              data-closed:zoom-out-95
              data-open:zoom-in-95
              rounded-2xl shadow-lg max-w-lg
              data-open:animate-in
              data-closed:animate-out
              fixed top-1/2 left-1/2 z-50 grid max-h-[85dvh] w-[calc(100%-2rem)] -translate-x-1/2
              -translate-y-1/2 grid-rows-[auto_minmax(0,1fr)] border duration-200 outline-none
            `,

            className,
          )}
          {...props}
        >
          {children}

          <DialogPrimitive.Close
            ref={closeButtonRef}
            aria-label={t`Close`}
            className="end-3 top-3 absolute"
            render={<Button size="icon" variant="ghost" />}
          >
            <XIcon />
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPortal>
    )
}

export type ResponsiveDialogHeaderProps = useRender.ComponentProps<"div"> & {}

export const ResponsiveDialogHeader: React.FC<ResponsiveDialogHeaderProps> = ({
  className,
  render,
  ...props
}) => {
  const isSheet = useIsSheet()

  const defaultProps = {
    className: cn("gap-2 p-6 pb-3 flex flex-col", !isSheet && "pe-14", className),
    "data-slot": "responsive-dialog-header",
  }

  return useRender({ defaultTagName: "div", props: mergeProps<"div">(defaultProps, props), render })
}

export type ResponsiveDialogTitleProps = DrawerTitleProps & {}

export const ResponsiveDialogTitle: React.FC<ResponsiveDialogTitleProps> = (props) => (
  <DrawerTitle data-slot="responsive-dialog-title" {...props} />
)

export type ResponsiveDialogDescriptionProps = DrawerDescriptionProps & {}

export const ResponsiveDialogDescription: React.FC<ResponsiveDialogDescriptionProps> = (props) => (
  <DrawerDescription data-slot="responsive-dialog-description" {...props} />
)

export type ResponsiveDialogPanelProps = React.ComponentProps<"div"> & {}

export const ResponsiveDialogPanel: React.FC<ResponsiveDialogPanelProps> = ({
  className,
  ...props
}) => {
  const isSheet = useIsSheet()
  const panelClassName = cn("p-6 pt-1", className)

  if (isSheet) {
    return <DrawerPanel data-slot="responsive-dialog-panel" className={panelClassName} {...props} />
  } else
    return (
      <ScrollArea scrollFade>
        <div data-slot="responsive-dialog-panel" className={panelClassName} {...props} />
      </ScrollArea>
    )
}
