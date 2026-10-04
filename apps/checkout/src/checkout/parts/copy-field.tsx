import { FieldError, Input } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { useClipboard } from "@mantine/hooks"
import { CopyIcon } from "lucide-react"

export type CopyFieldProps = {
  label: string
  value: string
  className?: string
  testId?: string
}

export const CopyField = ({ label, value, className, testId }: CopyFieldProps) => {
  const { copy, copied, error } = useClipboard()

  return (
    <div className={className} data-testid={testId}>
      <div className="mb-1 text-muted-foreground font-medium tracking-wider text-[11px] uppercase">
        {label}
      </div>

      <button
        type="button"
        aria-label={t`Copy ${label}`}
        onClick={() => copy(value)}
        className={cn(`
          gap-2 rounded-lg border-border bg-muted/50 px-3 py-2.5 text-xs font-mono
          hover:bg-muted
          flex w-full cursor-pointer items-center border text-left transition-all
        `)}
      >
        <span className="min-w-0 flex-1 truncate" aria-live="polite">
          {copied ? <span className="text-success font-semibold">{t`Copied!`}</span> : value}
        </span>

        <CopyIcon className="size-3.5 text-muted-foreground shrink-0" />
      </button>

      {error && (
        <div className="mt-2 gap-1.5 flex flex-col">
          <FieldError>{t`Couldn't copy. Select the text below and copy it manually.`}</FieldError>

          <Input
            readOnly
            aria-label={label}
            value={value}
            onFocus={(event) => event.currentTarget.select()}
            className="text-xs font-mono"
          />
        </div>
      )}
    </div>
  )
}
