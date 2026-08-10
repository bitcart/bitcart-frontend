import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@bitcart/ui-kit/components"

export const DefaultCardExample: React.FC = () => (
  <Card className="max-w-sm w-full">
    <CardHeader>
      <CardTitle>Store overview</CardTitle>
      <CardDescription>Your store at a glance</CardDescription>

      <CardAction>
        <Badge variant="secondary">Live</Badge>
      </CardAction>
    </CardHeader>

    <CardContent>
      <p className="text-sm">12 invoices were paid this week, totaling 0.024 BTC.</p>
    </CardContent>

    <CardFooter className="gap-2">
      <Button size="sm">View invoices</Button>

      <Button variant="outline" size="sm">
        Settings
      </Button>
    </CardFooter>
  </Card>
)
