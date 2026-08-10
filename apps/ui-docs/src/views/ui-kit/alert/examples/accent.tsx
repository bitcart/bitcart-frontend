import { Alert, AlertDescription, AlertTitle } from "@bitcart/ui-kit/components"
import { SparklesIcon } from "lucide-react"

export const AccentAlertExample: React.FC = () => (
  <Alert variant="accent" className="max-w-md">
    <SparklesIcon />
    <AlertTitle>New feature available</AlertTitle>
    <AlertDescription>You can now accept payments in multiple currencies.</AlertDescription>
  </Alert>
)
