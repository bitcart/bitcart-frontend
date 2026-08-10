import { Button, Toaster } from "@bitcart/ui-kit/components"
import { toast } from "@bitcart/ui-kit/utils"

const TOASTER_ID = "toaster-example-close-button"

const showToast = () =>
  toast.warning("Refund is still pending", {
    description: "The transaction has not been confirmed yet. Check back in a few minutes.",
    toasterId: TOASTER_ID,
  })

export const CloseButtonToasterExample: React.FC = () => (
  <>
    <Button variant="outline" onClick={showToast}>
      Show toast
    </Button>

    <Toaster closeButton duration={10_000} id={TOASTER_ID} />
  </>
)
