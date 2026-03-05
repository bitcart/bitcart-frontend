import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
  type InputGroupAddonProps,
  type TextareaProps,
} from "@bitcart/ui-kit/components"
import { useCallback, useMemo } from "react"

import { useFieldContext } from "@/contexts/form"

export type TextareaFieldInputAddonProps = Omit<InputGroupAddonProps, "align"> & {
  align?: "block-start" | "block-end"
}

export type TextareaFieldProps = Partial<Pick<TextareaProps, "cols" | "rows">> & {
  required?: boolean
  label: string
  placeholder?: string
  description?: string
  inputAddons?: TextareaFieldInputAddonProps[]
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  //! Not to be forwarded to the input element, as it'll cause conflicts with the validation flow
  required: isRequired = false,
  label,
  description,
  inputAddons,
  ...props
}) => {
  const { name, state, handleChange } = useFieldContext<string>()
  const elementId = useMemo(() => `field-${name}`, [name])
  const isInvalid = state.meta.isTouched && !state.meta.isValid

  const onInputChange = useCallback(
    ({ target }: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(target.value),
    [handleChange],
  )

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={elementId} hasRedAsterisk={isRequired}>
        {label}
      </FieldLabel>

      <InputGroup>
        <InputGroupTextarea
          id={elementId}
          name={name}
          value={state.value}
          onChange={onInputChange}
          autoComplete="off"
          aria-invalid={isInvalid}
          aria-required={isRequired}
          {...props}
        />

        {inputAddons?.map((addonProps, idx) => (
          <InputGroupAddon key={idx} {...addonProps} />
        ))}
      </InputGroup>

      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={state.meta.errors} />}
    </Field>
  )
}
