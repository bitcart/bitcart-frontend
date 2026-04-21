//* Ported from: https://coss.com/ui

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { ChevronsUpDownIcon, XIcon } from "lucide-react"

import { cn } from "@/utils"

import { AutocompleteTrigger } from "../atoms/autocomplete"
import { Input } from "../atoms/input"

const AutocompleteClear: React.FC<AutocompletePrimitive.Clear.Props> = ({
  className,
  ...props
}) => {
  return (
    <AutocompletePrimitive.Clear
      className={cn(
        `
          end-0.5 size-8 rounded-md
          pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11
          sm:size-7
          [&_svg:not-[class*='size-']]:size-4.5
          sm:[&_svg:not-[class*='size-']]:size-4
          absolute top-1/2 inline-flex shrink-0 -translate-y-1/2 cursor-pointer items-center
          justify-center border border-transparent opacity-80
          transition-[color,background-color,box-shadow,opacity] outline-none
          hover:opacity-100
          pointer-coarse:after:absolute
          [&_svg]:pointer-events-none [&_svg]:shrink-0
        `,

        className,
      )}
      data-slot="autocomplete-clear"
      {...props}
    >
      <XIcon />
    </AutocompletePrimitive.Clear>
  )
}

export type AutocompleteInputProps = Omit<AutocompletePrimitive.Input.Props, "size"> & {
  showTrigger?: boolean
  showClear?: boolean
  startAddon?: React.ReactNode
  size?: "sm" | "default" | "lg" | number
  ref?: React.Ref<HTMLInputElement>
  triggerProps?: AutocompletePrimitive.Trigger.Props
  clearProps?: AutocompletePrimitive.Clear.Props
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  className,
  showTrigger = false,
  showClear = false,
  startAddon,
  size,
  triggerProps,
  clearProps,
  ...props
}) => {
  const sizeValue = (size ?? "default") as "sm" | "default" | "lg" | number

  return (
    <AutocompletePrimitive.InputGroup
      className="text-foreground relative w-full not-has-[>*.w-full]:w-fit has-disabled:opacity-64"
      data-slot="autocomplete-input-group"
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className={cn(`
            inset-y-0
            [&_svg:not-[class*='size-']]:size-4.5
            sm:[&_svg:not-[class*='size-']]:size-4
            [&_svg]:-mx-0.5
            pointer-events-none absolute start-px z-10 flex items-center
            ps-[calc(var(--spacing)*3-1px)] opacity-80
            has-[+[data-size=sm]]:ps-[calc(var(--spacing)*2.5-1px)]
          `)}
          data-slot="autocomplete-start-addon"
        >
          {startAddon}
        </div>
      )}

      <AutocompletePrimitive.Input
        className={cn(
          startAddon &&
            `
              sm:data-[size=sm]:*:data-[slot=autocomplete-input]:ps-[calc(var(--spacing)*7-1px)]
              sm:*:data-[slot=autocomplete-input]:ps-[calc(var(--spacing)*8-1px)]
              *:data-[slot=autocomplete-input]:ps-[calc(var(--spacing)*8.5-1px)]
              data-[size=sm]:*:data-[slot=autocomplete-input]:ps-[calc(var(--spacing)*7.5-1px)]
            `,

          {
            [`
              has-[+[data-slot=autocomplete-trigger],+[data-slot=autocomplete-clear]]:*:data-[slot=autocomplete-input]:pe-6.5
            `]: sizeValue === "sm",

            [`
              has-[+[data-slot=autocomplete-trigger],+[data-slot=autocomplete-clear]]:*:data-[slot=autocomplete-input]:pe-7
            `]: sizeValue !== "sm",
          },
          className,
        )}
        data-slot="autocomplete-input"
        render={<Input nativeInput size={sizeValue} />}
        {...props}
      />

      {showTrigger && (
        <AutocompleteTrigger
          className={cn(
            `
              size-8 rounded-md
              pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11
              sm:size-7
              [&_svg:not-[class*='size-']]:size-4.5
              sm:[&_svg:not-[class*='size-']]:size-4
              absolute top-1/2 inline-flex shrink-0 -translate-y-1/2 cursor-pointer items-center
              justify-center border border-transparent opacity-80 transition-colors outline-none
              hover:opacity-100
              has-[+[data-slot=autocomplete-clear]]:hidden
              pointer-coarse:after:absolute
              [&_svg]:pointer-events-none [&_svg]:shrink-0
            `,

            {
              "end-0": sizeValue === "sm",
              "end-0.5": sizeValue !== "sm",
            },
          )}
          {...triggerProps}
        >
          <AutocompletePrimitive.Icon data-slot="autocomplete-icon">
            <ChevronsUpDownIcon />
          </AutocompletePrimitive.Icon>
        </AutocompleteTrigger>
      )}

      {showClear && (
        <AutocompleteClear
          className={cn(
            `
              size-8 rounded-md
              pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11
              sm:size-7
              [&_svg:not-[class*='size-']]:size-4.5
              sm:[&_svg:not-[class*='size-']]:size-4
              absolute top-1/2 inline-flex shrink-0 -translate-y-1/2 cursor-pointer items-center
              justify-center border border-transparent opacity-80 transition-colors outline-none
              hover:opacity-100
              has-[+[data-slot=autocomplete-clear]]:hidden
              pointer-coarse:after:absolute
              [&_svg]:pointer-events-none [&_svg]:shrink-0
            `,

            {
              "end-0": sizeValue === "sm",
              "end-0.5": sizeValue !== "sm",
            },
          )}
          {...clearProps}
        >
          <XIcon />
        </AutocompleteClear>
      )}
    </AutocompletePrimitive.InputGroup>
  )
}
