import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  type InputGroupAddonProps,
} from "@bitcart/ui-kit/components"
import { useCallback, useMemo } from "react"

import { useFieldContext } from "@/contexts/form"

export type TextFieldInputAddonProps = Omit<InputGroupAddonProps, "align"> & {
  align?: "inline-start" | "inline-end"
}

export type TextFieldProps = {
  required?: boolean
  label: string
  placeholder?: string
  description?: string
  type: "email" | "number" | "password" | "search" | "tel" | "text" | "url"
  inputAddons?: TextFieldInputAddonProps[]

  classNames?: {
    root?: string
    input?: string
  }
}

export const TextField: React.FC<TextFieldProps> = ({
  //! Not to be forwarded to the input element, as it'll cause conflicts with the validation flow
  required: isRequired = false,
  label,
  description,
  inputAddons,
  classNames,
  ...props
}) => {
  const { name, state, handleChange } = useFieldContext<string>()
  const elementId = useMemo(() => `field-${name}`, [name])
  const descriptionId = `${elementId}-description`
  const errorId = `${elementId}-error`
  const isInvalid = state.meta.isTouched && !state.meta.isValid

  const ariaDescribedBy =
    [description ? descriptionId : null, isInvalid ? errorId : null].filter(Boolean).join(" ") ||
    undefined

  const onInputChange = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => handleChange(target.value),
    [handleChange],
  )

  return (
    <Field data-invalid={isInvalid} className={classNames?.root}>
      <FieldLabel htmlFor={elementId} hasRedAsterisk={isRequired}>
        {label}
      </FieldLabel>

      <InputGroup>
        <InputGroupInput
          id={elementId}
          name={name}
          value={state.value ?? ""}
          onChange={onInputChange}
          autoComplete="off"
          className={classNames?.input}
          aria-invalid={isInvalid}
          aria-required={isRequired}
          aria-describedby={ariaDescribedBy}
          {...props}
        />

        {inputAddons?.map((addonProps, idx) => (
          <InputGroupAddon key={idx} {...addonProps} />
        ))}
      </InputGroup>

      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {isInvalid && <FieldError id={errorId} errors={state.meta.errors} />}
    </Field>
  )
}
