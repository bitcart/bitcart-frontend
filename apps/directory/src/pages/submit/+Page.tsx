import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@bitcart/ui-kit/components"
import { Link } from "@bitcart/vike-kit/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { ArrowLeft, Info } from "lucide-react"

import { CatalogSubmissionForm } from "@/features/catalog-submission"

export default function Page() {
  const { t } = useLingui()

  return (
    <div className="bg-background pt-20 min-h-screen">
      <div className="gap-8 max-w-4xl px-4 md:px-6 lg:px-8 py-8 mx-auto flex flex-col">
        <div className="flex justify-between">
          <Button render={<Link href="/" />} nativeButton={false} variant="ghost">
            <ArrowLeft className="mr-2" />
            <span>{t`Back to Directory`}</span>
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t`Submit New Entry`}</h1>

          <p className="text-muted-foreground text-lg">
            {t`Add your app, hosting service, or merchant to the Bitcart Directory`}
          </p>
        </div>

        <Alert variant="accent">
          <Info className="size-5" />
          <AlertTitle>{t`How it works:`}</AlertTitle>

          <AlertDescription>
            <Trans>
              This form will create a GitHub issue with your submission details. Our team will
              review your entry and add it to the directory if approved.
            </Trans>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{t`Entry Details`}</CardTitle>
          </CardHeader>

          <CardContent>
            <CatalogSubmissionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
