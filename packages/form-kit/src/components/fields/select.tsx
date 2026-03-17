import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@bitcart/ui-kit/components"
import { useMemo } from "react"

import { useFieldContext } from "@/contexts/form"

import type { SelectOption } from "../types"

export type SelectFieldProps = {
  required?: boolean
  label: string
  placeholder: string
  options: SelectOption[]
  description?: string
}

export const SelectField: React.FC<SelectFieldProps> = ({
  //! Not to be forwarded to the input element, as it'll cause conflicts with the validation flow
  required: isRequired = false,
  label,
  placeholder,
  options,
  description,
}) => {
  const { name, state, handleChange } = useFieldContext<string>()
  const elementId = useMemo(() => `field-${name}`, [name])
  const isInvalid = state.meta.isTouched && !state.meta.isValid

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={elementId} hasRedAsterisk={isRequired}>
        {label}
      </FieldLabel>

      <Select
        name={name}
        value={state.value}
        onValueChange={(value) => {
          if (value !== null) handleChange(value)
        }}
        items={options}
        aria-required={isRequired}
      >
        <SelectTrigger id={elementId} aria-invalid={isInvalid}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={state.meta.errors} />}
    </Field>
  )
}
