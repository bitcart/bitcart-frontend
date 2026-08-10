import { Alert, AlertDescription, AlertTitle } from "@bitcart/ui-kit/components"
import { CircleAlertIcon } from "lucide-react"

export const DestructiveAlertExample: React.FC = () => (
  <Alert variant="destructive" className="max-w-md">
    <CircleAlertIcon />
    <AlertTitle>Payment failed</AlertTitle>

    <AlertDescription>
      <p>The transaction was rejected by the network. Please verify:</p>

      <ul className="text-sm list-inside list-disc">
        <li>Your wallet has sufficient funds</li>
        <li>The destination address is correct</li>
      </ul>
    </AlertDescription>
  </Alert>
)
