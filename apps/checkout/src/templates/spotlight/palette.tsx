import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
  type CommandInputProps,
} from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import { ClockIcon } from "lucide-react"
import { useEffect, useRef, type ReactNode } from "react"

import { CheckoutConnectionBanner, CheckoutFooter, useCheckout } from "#/checkout"

//* Base UI displays an option's `label` and identifies options by `value`.
export type PaletteOption = {
  value: string
  label: string
  content: ReactNode
  onSelect: () => void
}

type PaletteProps = {
  query: string
  onQueryChange: (query: string) => void
  onEscape?: () => void
  placeholder: string
  listLabel: string
  options: PaletteOption[]
  emptyMessage?: string
  children?: ReactNode
}

/**
 * The command palette shell shared by both Spotlight screens, built on the UI Kit's `Command`. The
 * screens filter their own options; the palette renders them as given.
 */
export const Palette = ({
  query,
  onQueryChange,
  onEscape,
  placeholder,
  listLabel,
  options,
  emptyMessage,
  children,
}: PaletteProps) => {
  const { countdown } = useCheckout()
  const inputRef = useRef<HTMLInputElement>(null)
  const isListShown = options.length > 0 || Boolean(emptyMessage)

  //* The palette opens with the search bar focused, the way command palettes do.
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown: CommandInputProps["onKeyDown"] = (event) => {
    if (event.key === "Escape" && onEscape) {
      event.preventBaseUIHandler()
      onEscape()
    }
  }

  return (
    <Command
      items={options}
      mode="none"
      value={query}
      onValueChange={(nextQuery, { reason }) => {
        //* Only typing or clearing edits the query; a picked option's label is discarded.
        if (reason === "input-change" || reason === "input-clear") {
          onQueryChange(nextQuery)
        }
      }}
    >
      <div
        className={cn(`
          max-w-lg rounded-2xl border-border bg-card text-card-foreground shadow-2xl w-full
          overflow-hidden border
        `)}
      >
        <div className="pe-5 border-border flex items-center border-b">
          <div className="min-w-0 flex-1">
            <CommandInput
              ref={inputRef}
              showClear
              aria-label={placeholder}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div
            className={cn(`
              gap-1 text-muted-foreground font-mono flex shrink-0 items-center text-[11px]
              tabular-nums
            `)}
          >
            <ClockIcon className="size-3" />
            {countdown.formatted}
          </div>
        </div>

        <CheckoutConnectionBanner />

        {isListShown && (
          <div>
            <div
              className={cn(`
                px-4 pt-3 text-muted-foreground font-medium tracking-wider text-[10px] uppercase
              `)}
            >
              {listLabel}
            </div>

            {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}

            <CommandList aria-label={listLabel} className="max-h-64">
              {(option: PaletteOption) => (
                <CommandItem
                  key={option.value}
                  value={option}
                  onClick={option.onSelect}
                  className="gap-3 px-3 py-2.5 flex items-center"
                >
                  {option.content}
                </CommandItem>
              )}
            </CommandList>

            <div className="gap-4 px-5 pb-3 text-muted-foreground flex items-center text-[10px]">
              <span className="gap-1 flex items-center">
                <Kbd>↑↓</Kbd>
                {t`navigate`}
              </span>

              <span className="gap-1 flex items-center">
                <Kbd>↵</Kbd>
                {t`select`}
              </span>
            </div>
          </div>
        )}

        {children}

        <CheckoutFooter />
      </div>
    </Command>
  )
}
