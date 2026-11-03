//* Originally ported from: https://github.com/shadcn-ui/ui/blob/main/apps/v4/mdx-components.tsx

import { cn } from "@/utils"

export type HeadingAnchorProps = Omit<React.ComponentProps<"a">, "href"> & {
  href: `#${string}`
}

export const HeadingAnchor: React.FC<HeadingAnchorProps> = ({ className, children, ...props }) => {
  return (
    <a
      data-slot="heading-anchor"
      className={cn(
        "group/heading-anchor [font-weight:inherit] text-inherit no-underline",
        className,
      )}
      {...props}
    >
      <span className="underline-offset-4 group-hover/heading-anchor:underline">{children}</span>

      <span
        aria-hidden="true"
        className={cn(`
          ml-2 text-muted-foreground opacity-0 transition-opacity
          group-hover/heading-anchor:opacity-100
          group-focus-visible/heading-anchor:opacity-100
        `)}
      >
        #
      </span>
    </a>
  )
}
