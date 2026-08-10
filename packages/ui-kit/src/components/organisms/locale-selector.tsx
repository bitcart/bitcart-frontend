import { getLocaleDisplayName, type LocaleId, type PseudoLocaleId } from "@bitcart/core/utils"
import { LOCALE_SELECTOR_TRIGGER_TESTID } from "@bitcart/qa"
import { t } from "@lingui/core/macro"
import { Globe } from "lucide-react"
import { useCallback } from "react"

import { useLayoutContext } from "@/hooks"
import { cn } from "@/utils"

import { Button, type ButtonProps } from "../atoms/button"
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../atoms/dropdown-menu"
import { DropdownMenuContent } from "../molecules/dropdown-menu"

export type LocaleSelectorProps<TSupportedLocaleId extends LocaleId | PseudoLocaleId> = {
  activeLocaleId: TSupportedLocaleId
  optionLocaleIds: readonly (LocaleId | PseudoLocaleId)[]
  handleSelect: (localeId: TSupportedLocaleId, callback?: VoidFunction) => void
  triggerVariant?: ButtonProps["variant"]
  classNames?: { trigger?: string }
}

export const LocaleSelector = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>({
  activeLocaleId,
  optionLocaleIds,
  handleSelect,
  triggerVariant = "ghost",
  classNames,
}: LocaleSelectorProps<TSupportedLocaleId>) => {
  const createHandleSelect = useCallback(
    (localeId: TSupportedLocaleId) => () => handleSelect(localeId),
    [handleSelect],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={triggerVariant} />}
        className={classNames?.trigger}
        aria-label={t`Select language`}
        data-testid={LOCALE_SELECTOR_TRIGGER_TESTID}
      >
        <Globe />

        <span className="text-sm font-medium capitalize">
          {getLocaleDisplayName(activeLocaleId)}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        <DropdownMenuGroup>
          {optionLocaleIds.map((localeId) => (
            <DropdownMenuItem
              key={localeId}
              onClick={createHandleSelect(localeId as TSupportedLocaleId)}
              render={
                <Button
                  variant={localeId === activeLocaleId ? "accent" : "ghost"}
                  className={cn("focus-visible:ring-transparent", {
                    "text-foreground": localeId === activeLocaleId,
                  })}
                  aria-label={getLocaleDisplayName(localeId)}
                />
              }
            >
              <span className="w-full text-left capitalize">{getLocaleDisplayName(localeId)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type LayoutLocaleSelectorProps<TSupportedLocaleId extends LocaleId | PseudoLocaleId> = Omit<
  LocaleSelectorProps<TSupportedLocaleId>,
  "activeLocaleId" | "optionLocaleIds"
> & {}

export const LayoutLocaleSelector = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>(
  props: LayoutLocaleSelectorProps<TSupportedLocaleId>,
) => {
  const {
    layoutConfig: {
      i18n: { activeLocale, availableLocales },
    },
  } = useLayoutContext()

  return (
    <LocaleSelector
      {...props}
      activeLocaleId={activeLocale as TSupportedLocaleId}
      optionLocaleIds={availableLocales}
    />
  )
}
