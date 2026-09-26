import { Button, Spinner, type ButtonProps } from "@bitcart/ui-kit/components"
import { useSelector } from "@tanstack/react-form"
import { useEffect, useRef } from "react"

import { useFormContext } from "@/contexts/form"

export type SubmitButtonProps = Omit<ButtonProps, "type" | "disabled"> & {
  icon?: React.ReactNode
  label: string
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ icon, label, size = "lg" }) => {
  const form = useFormContext()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const settledAttemptsRef = useRef(0)

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting)
  const isValidating = useSelector(form.store, (state) => state.isValidating)
  const isValid = useSelector(form.store, (state) => state.isValid)
  const submissionAttempts = useSelector(form.store, (state) => state.submissionAttempts)

  useEffect(() => {
    if (!isSubmitting && !isValidating && submissionAttempts > settledAttemptsRef.current) {
      settledAttemptsRef.current = submissionAttempts

      if (!isValid) {
        buttonRef.current?.form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      }
    }
  }, [isSubmitting, isValidating, isValid, submissionAttempts])

  return (
    <Button
      ref={buttonRef}
      type="submit"
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      size={size}
    >
      {isSubmitting ? <Spinner /> : icon}
      <span>{label}</span>
    </Button>
  )
}
