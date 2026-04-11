import { getLocaleDisplayName, type LocaleId, type PseudoLocaleId } from "@bitcart/core/utils"
import { LOCALE_SELECTOR_TRIGGER_TESTID } from "@bitcart/qa"
import { t } from "@lingui/core/macro"
import { Globe } from "lucide-react"
import { useCallback } from "react"

import { cn } from "@/utils"

import { Button } from "../atoms/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../atoms/dropdown-menu"

export type LocaleSelectorProps<TSupportedLocaleId extends LocaleId | PseudoLocaleId> = {
  activeLocaleId: TSupportedLocaleId
  handleSelect: (localeId: TSupportedLocaleId, callback?: VoidFunction) => void
  optionLocaleIds: readonly TSupportedLocaleId[]
}

export const LocaleSelector = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>({
  activeLocaleId,
  handleSelect,
  optionLocaleIds,
}: LocaleSelectorProps<TSupportedLocaleId>) => {
  const createHandleSelect = useCallback(
    (localeId: TSupportedLocaleId) => () => handleSelect(localeId),
    [handleSelect],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" />}
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
              onClick={createHandleSelect(localeId)}
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
