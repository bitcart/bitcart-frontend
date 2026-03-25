import { getLocaleDisplayName, type LocaleId } from "@bitcart/core/utils"
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

export type LocaleSelectorProps<TSupportedLocaleId extends LocaleId> = {
  activeLocaleId: TSupportedLocaleId
  handleSelect: (localeId: TSupportedLocaleId, callback?: VoidFunction) => void
  optionLocaleIds: readonly TSupportedLocaleId[]
}

export const LocaleSelector = <TSupportedLocaleId extends LocaleId>({
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
      <DropdownMenuTrigger render={<Button variant="ghost" />} aria-label={t`Select language`}>
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
