//* Ported from: https://coss.com/ui

import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/utils"

import { DrawerContent } from "../atoms/drawer"
import { ScrollArea } from "./scroll-area"

export type DrawerPanelProps = useRender.ComponentProps<"div"> & {
  scrollFade?: boolean
  scrollable?: boolean
  allowSelection?: boolean
}

export const DrawerPanel: React.FC<DrawerPanelProps> = ({
  className,
  scrollFade = true,
  scrollable = true,
  allowSelection = true,
  render,
  ...props
}) => {
  const defaultProps = {
    className: cn(
      `
        p-6
        in-[[data-slot=drawer-popup]:has([data-slot=drawer-header])]:pt-1
        in-[[data-slot=drawer-popup]:has([data-slot=drawer-footer]:not(.border-t))]:pb-1
      `,

      { "cursor-default": !allowSelection },
      className,
    ),

    "data-slot": "drawer-panel",
  }

  const content = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  })

  if (scrollable) {
    return (
      <ScrollArea className="touch-auto" scrollFade={scrollFade}>
        {content}
      </ScrollArea>
    )
  } else return content
}
