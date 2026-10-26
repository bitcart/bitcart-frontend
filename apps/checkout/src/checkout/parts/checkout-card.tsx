import { Card } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"

type CheckoutCardProps = {
  className?: string
  children: React.ReactNode
}

export const CheckoutCard = ({ className, children }: CheckoutCardProps) => {
  return (
    <Card
      className={cn(
        "max-w-md rounded-2xl py-0 gap-0 shadow-2xl relative w-full overflow-hidden border-0",
        className,
      )}
    >
      {children}
    </Card>
  )
}
