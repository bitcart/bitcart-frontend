import {
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
  type CommandInputProps,
} from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { CircleHelpIcon } from "lucide-react"
import { useEffect, useRef, type ReactNode } from "react"

import {
  CHECKOUT_COUNTDOWN_TESTID,
  CheckoutCloseButton,
  CheckoutConnectionBanner,
  CheckoutFooter,
  CheckoutHelp,
  ExpiringSoonNotice,
  ExpiryProgress,
  ExtensionSlot,
  StoreBrand,
  useCheckout,
  useCheckoutCountdown,
  useRemainingTime,
} from "#/checkout"

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
  searchLabel: string
  listLabel: string
  listTestId?: string
  options: PaletteOption[]
  emptyMessage?: string
  children?: ReactNode
}

const StoreChip = () => (
  <span
    className={cn(`
      px-2 py-1 bg-accent text-accent-foreground ms-4 rounded-md min-w-0 inline-flex max-w-1/2
      shrink-0 items-center
    `)}
  >
    <StoreBrand size="sm" className="max-w-full" />
  </span>
)

const RemainingTime = () => {
  const { isExpiringSoon } = useCheckoutCountdown()
  const { text } = useRemainingTime()

  return (
    <div
      aria-hidden
      data-testid={CHECKOUT_COUNTDOWN_TESTID}
      className={cn(
        "font-mono shrink-0 text-[11px] tabular-nums",
        isExpiringSoon ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {text}
    </div>
  )
}

const HelpRow = () => {
  const { t } = useLingui()
  const { environment } = useCheckout()

  if (environment.terminal) {
    return null
  } else
    return (
      <div className="px-3 py-1 border-border border-t">
        <CheckoutHelp
          trigger={<Button variant="ghost" size="sm" className="text-muted-foreground" />}
        >
          <CircleHelpIcon />
          {t`Help with this payment`}
        </CheckoutHelp>
      </div>
    )
}

/**
 * The command palette shell shared by both Spotlight screens, built on the UI Kit's `Command`. The
 * screens filter their own options; the palette renders them as given.
 */
export const Palette = ({
  query,
  onQueryChange,
  onEscape,
  searchLabel,
  listLabel,
  listTestId,
  options,
  emptyMessage,
  children,
}: PaletteProps) => {
  const { t } = useLingui()
  const { environment } = useCheckout()
  const inputRef = useRef<HTMLInputElement>(null)
  const isListShown = options.length > 0 || Boolean(emptyMessage)

  //* The palette opens with the search bar focused, the way command palettes do, but only with a
  //* mouse or trackpad: on a touchscreen, focusing it pops the on-screen keyboard over the checkout.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus()
  }, [])

  const handleKeyDown: CommandInputProps["onKeyDown"] = (event) => {
    if (event.key === "Escape" && (query || onEscape)) {
      event.preventDefault()
      event.preventBaseUIHandler()

      if (query) {
        onQueryChange("")
      } else onEscape?.()
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
        <div
          className={cn(
            "pe-5 border-border flex items-center border-b",
            environment.terminal && "py-2.5",
          )}
        >
          <StoreChip />

          <div className="min-w-0 flex-1">
            {!environment.terminal && (
              <CommandInput
                ref={inputRef}
                startAddon={null}
                showClear
                aria-label={searchLabel}
                placeholder={t`Search…`}
                onKeyDown={handleKeyDown}
              />
            )}
          </div>

          <RemainingTime />
          <CheckoutCloseButton className="ms-2 -me-3" />
        </div>

        <ExpiryProgress className="h-0.5" />

        <ExtensionSlot name="checkout:header-extra" className="px-5 py-3 border-border border-b" />
        <CheckoutConnectionBanner />
        <ExpiringSoonNotice className="px-5 py-2" />

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

            <CommandList aria-label={listLabel} data-testid={listTestId} className="max-h-64">
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

        <HelpRow />
        <CheckoutFooter />
      </div>
    </Command>
  )
}
