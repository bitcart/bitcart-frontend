import { Alert, AlertDescription, AlertTitle } from "@bitcart/ui-kit/components"
import { CircleCheckIcon } from "lucide-react"

export const DefaultAlertExample: React.FC = () => (
  <Alert variant="default" className="max-w-md">
    <CircleCheckIcon />
    <AlertTitle>Payment confirmed</AlertTitle>
    <AlertDescription>The invoice has been settled on-chain.</AlertDescription>
  </Alert>
)
