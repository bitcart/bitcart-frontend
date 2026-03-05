import { Button, type ButtonProps } from "@bitcart/ui-kit/components"

import { useFormContext } from "@/contexts/form"

export type SubmitButtonProps = Omit<ButtonProps, "type" | "disabled"> & {
  icon?: React.ReactNode
  label: string
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ icon, label, size = "lg" }) => {
  const form = useFormContext()

  return (
    <form.Subscribe selector={({ canSubmit, isPristine }) => [canSubmit, isPristine]}>
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
