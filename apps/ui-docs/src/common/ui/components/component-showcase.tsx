import { Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { DynamicCodeBlock } from "@fumadocs/base-ui/components/dynamic-codeblock"
import { useLingui } from "@lingui/react/macro"
import { useCallback, useId, useState } from "react"

const DEFAULT_COLLAPSED_LINES = 3

export type ComponentShowcaseProps = {
  title?: string
  description?: string

  align?: "center" | "start" | "end"

  /**
   * Source snippet shown under the preview.
   */
  code: string

  /**
   * How many lines of `code` stay visible behind the gradient while collapsed.
   */
  collapsedLines?: number

  hideCode?: boolean

  /**
   * Shiki language of `code`.
   *
   * @see https://shiki.style
   */
  lang?: string

  classNames?: {
    root?: string
    previewContainer?: string
  }

  /** Live component rendered in the preview pane. */
  children: React.ReactNode
}

/**
 * Story card in the shape of the shadcn/ui docs component preview: a live preview pane
 * stacked on top of its source, which stays collapsed to a few faded lines behind a
 * "View Code" affordance until expanded.
 */
export const ComponentShowcase: React.FC<ComponentShowcaseProps> = ({
  title,
  description,
  align = "center",
  code,
  collapsedLines = DEFAULT_COLLAPSED_LINES,
  hideCode = false,
  lang = "tsx",
  classNames,
  children,
}) => {
  const { t } = useLingui()
  const [isCodeVisible, setIsCodeVisible] = useState(false)
  const codeRegionId = useId()
  const toggleCode = useCallback(() => setIsCodeVisible((visible) => !visible), [])
  const collapsedCode = code.split("\n").slice(0, collapsedLines).join("\n")

  const collapseTrigger = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-expanded
      aria-controls={codeRegionId}
      className="border-fd-border text-fd-muted-foreground w-full rounded-none border-t"
      onClick={toggleCode}
    >
      {t`Collapse`}
    </Button>
  )

  return (
    <figure className={cn("not-prose my-6 gap-3 flex flex-col", classNames?.root)}>
      {(title || description) && (
        <figcaption className="gap-1 flex flex-col">
          {title && <span className="text-fd-foreground font-semibold">{title}</span>}
          {description && <span className="text-fd-muted-foreground text-sm">{description}</span>}
        </figcaption>
      )}

      <div
        className={cn(`
          border-fd-border bg-fd-background rounded-xl flex flex-col overflow-hidden border
        `)}
      >
        <div
          data-align={align}
          className={cn(
            "min-h-72 p-10 flex w-full justify-center",

            `
              data-[align=center]:items-center
              data-[align=end]:items-end
              data-[align=start]:items-start
            `,

            classNames?.previewContainer,
          )}
        >
          {children}
        </div>

        {!hideCode && (
          <div className="relative">
            <DynamicCodeBlock
              lang={lang}
              code={isCodeVisible ? code : collapsedCode}
              codeblock={{
                //* The card already draws the frame, so the code block only keeps its top border.
                className: "my-0 rounded-none border-x-0 border-b-0 shadow-none",
                allowCopy: isCodeVisible,
                viewportProps: { id: codeRegionId, className: "max-h-120" },
              }}
            />

            {isCodeVisible ? (
              collapseTrigger
            ) : (
              <div className="inset-0 absolute flex items-center justify-center">
                <div
                  className={cn(`
                    from-fd-card via-fd-card/60 inset-0 absolute bg-linear-to-t to-transparent
                  `)}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-expanded={false}
                  aria-controls={codeRegionId}
                  className="bg-fd-background relative z-3"
                  onClick={toggleCode}
                >
                  {t`View Code`}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </figure>
  )
}
