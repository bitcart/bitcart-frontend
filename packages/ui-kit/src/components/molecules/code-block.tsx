//* Originally ported from: https://ui.shadcn.com

import { useCopyStatus } from "@bitcart/hooks"
import { useLingui } from "@lingui/react/macro"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "@/utils"

import { Button, type ButtonProps } from "../atoms/button"

export type CodeBlockProps = React.ComponentProps<"div"> & {}

export const CodeBlock: React.FC<CodeBlockProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="code-block"
      className={cn(
        `
          group/code-block rounded-lg bg-muted/50 text-sm text-foreground
          has-[>[data-slot=code-block-content]:focus-visible]:border-ring
          has-[>[data-slot=code-block-content]:focus-visible]:ring-ring/50
          min-w-0
          relative flex w-full flex-col overflow-hidden border has-[>[data-slot=code-block-content]:focus-visible]:ring-3
        `,

        className,
      )}
      {...props}
    />
  )
}

export type CodeBlockHeaderProps = React.ComponentProps<"div"> & {}

export const CodeBlockHeader: React.FC<CodeBlockHeaderProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="code-block-header"
      className={cn(
        "gap-2 px-4 py-1.5 text-muted-foreground min-w-0 flex shrink-0 items-center border-b",
        className,
      )}
      {...props}
    />
  )
}

export type CodeBlockTitleProps = React.ComponentProps<"div"> & {}

export const CodeBlockTitle: React.FC<CodeBlockTitleProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="code-block-title"
      className={cn("text-xs font-mono min-w-0 truncate", className)}
      {...props}
    />
  )
}

export type CodeBlockActionsProps = React.ComponentProps<"div"> & {}

export const CodeBlockActions: React.FC<CodeBlockActionsProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="code-block-actions"
      className={cn("-my-1 -me-2 gap-1 ms-auto flex shrink-0 items-center", className)}
      {...props}
    />
  )
}

export type CodeBlockCopyButtonProps = Omit<ButtonProps, "value"> & {
  value: string | (() => string)
}

export const CodeBlockCopyButton: React.FC<CodeBlockCopyButtonProps> = ({
  value,
  variant = "ghost",
  size = "icon-sm",
  onClick,
  ...props
}) => {
  const { t } = useLingui()
  const { status, copy } = useCopyStatus<"code">()
  const isCopied = status?.outcome === "copied"

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        data-copied={isCopied || undefined}
        variant={variant}
        size={size}
        aria-label={t`Copy code`}
        onClick={(event) => {
          onClick?.(event)
          copy("code", typeof value === "function" ? value() : value)
        }}
        {...props}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </Button>

      <span aria-live="polite" className="sr-only">
        {status?.outcome === "copied" && t`Copied`}
        {status?.outcome === "failed" && t`Copying failed`}
      </span>
    </>
  )
}

export type CodeBlockContentProps = React.ComponentProps<"pre"> & {}

//* Colors Shiki output rendered with dual themes and `defaultColor: false`.
export const CodeBlockContent: React.FC<CodeBlockContentProps> = ({ className, ...props }) => {
  return (
    <pre
      data-slot="code-block-content"
      dir="ltr"
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users scroll long lines
      tabIndex={0}
      className={cn(
        `
          p-4 font-mono leading-relaxed
          min-h-0
          min-w-0
          overflow-auto text-start outline-none [&_span]:text-[color:var(--shiki-light)] dark:[&_span]:text-[color:var(--shiki-dark)]
        `,

        className,
      )}
      {...props}
    />
  )
}
