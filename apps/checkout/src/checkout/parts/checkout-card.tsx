import { Card } from "@bitcart/ui-kit/components"

type CheckoutCardProps = {
  children: React.ReactNode
}

export const CheckoutCard = ({ children }: CheckoutCardProps) => {
  return <Card className="max-w-md py-0 gap-0 relative w-full overflow-hidden">{children}</Card>
}
