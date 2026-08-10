import { Button, Toaster } from "@bitcart/ui-kit/components"
import { toast } from "@bitcart/ui-kit/utils"

const TOASTER_ID = "toaster-example-top-center"

const showToast = () =>
  toast("Store settings saved", {
    description: "Checkout now accepts Lightning payments.",
    toasterId: TOASTER_ID,
  })

export const TopCenterToasterExample: React.FC = () => (
  <>
    <Button variant="outline" onClick={showToast}>
      Show toast
    </Button>

    <Toaster id={TOASTER_ID} position="top-center" />
  </>
)
