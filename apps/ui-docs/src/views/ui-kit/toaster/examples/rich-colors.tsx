import { Button, Toaster } from "@bitcart/ui-kit/components"
import { toast } from "@bitcart/ui-kit/utils"

const TOASTER_ID = "toaster-example-rich-colors"

const showSuccessToast = () =>
  toast.success("Payout sent", {
    description: "0.5 BTC left the hot wallet.",
    toasterId: TOASTER_ID,
  })

const showInfoToast = () =>
  toast.info("Rate refreshed", {
    description: "BTC/USD is now 71,204.18.",
    toasterId: TOASTER_ID,
  })

const showWarningToast = () =>
  toast.warning("Fees are elevated", {
    description: "The next block is estimated at 84 sat/vB.",
    toasterId: TOASTER_ID,
  })

const showErrorToast = () =>
  toast.error("Wallet unreachable", {
    description: "The Lightning daemon refused the connection.",
    toasterId: TOASTER_ID,
  })

export const RichColorsToasterExample: React.FC = () => (
  <>
    <div className="gap-2 flex flex-wrap justify-center">
      <Button variant="outline" onClick={showSuccessToast}>
        Success
      </Button>

      <Button variant="outline" onClick={showInfoToast}>
        Info
      </Button>

      <Button variant="outline" onClick={showWarningToast}>
        Warning
      </Button>

      <Button variant="outline" onClick={showErrorToast}>
        Error
      </Button>
    </div>

    <Toaster richColors id={TOASTER_ID} />
  </>
)
