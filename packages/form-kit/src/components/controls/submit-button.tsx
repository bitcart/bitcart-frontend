import { Button, type ButtonProps } from "@bitcart/ui-kit/components"
import { useMemo } from "react"

import { useFormContext } from "@/contexts/form"

export type SubmitButtonProps = Omit<ButtonProps, "type" | "disabled"> & {
  icon?: React.ReactNode
  label: string
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ icon, label, size = "lg" }) => {
  const form = useFormContext()

  const subscriptionSelector = useMemo(
    () =>
      ({ canSubmit, isPristine }: (typeof form)["state"]) => [canSubmit, isPristine],

    [],
  )

  return (
    <form.Subscribe selector={subscriptionSelector}>
      {([_canSubmit, isPristine]) => {
        //* Allows triggering validation manually to highlight untouched required fields
        const isDisabled = isPristine

        return (
          <Button type="submit" disabled={isDisabled} size={size}>
            {icon}
            <span>{label}</span>
          </Button>
        )
      }}
    </form.Subscribe>
  )
}
