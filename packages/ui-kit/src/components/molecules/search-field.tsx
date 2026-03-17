import { t } from "@lingui/core/macro"
import { SearchIcon, X } from "lucide-react"
import { useCallback } from "react"

import { cn } from "@/utils"

import { Button } from "../atoms/button"
import type { InputProps } from "../atoms/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../atoms/input-group"

export type SearchFieldProps = Pick<InputProps, "placeholder"> & {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange: setValue,
  placeholder,
  className,
}) => {
  const handleChange = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => setValue(target.value),
    [setValue],
  )

  const handleReset = useCallback(() => setValue(""), [setValue])

  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <SearchIcon className="size-5 text-muted-foreground/80" />
      </InputGroupAddon>

      <InputGroupInput
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />

      <InputGroupAddon align="inline-end" className={cn({ hidden: value.length === 0 })}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleReset}
          title={t`Clear`}
          aria-label={t`Clear`}
        >
          <X className="size-5" />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}
