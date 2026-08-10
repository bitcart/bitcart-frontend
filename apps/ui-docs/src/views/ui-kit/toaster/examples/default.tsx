import { Button, Toaster } from "@bitcart/ui-kit/components"
import { toast } from "@bitcart/ui-kit/utils"

const TOASTER_ID = "toaster-example-default"

const showToast = () =>
  toast("Invoice #1042 paid", {
    description: "0.0241 BTC confirmed in block 912,338.",
    toasterId: TOASTER_ID,
  })

export const DefaultToasterExample: React.FC = () => (
  <>
    <Button variant="outline" onClick={showToast}>
      Show toast
    </Button>

    <Toaster id={TOASTER_ID} />
  </>
)
