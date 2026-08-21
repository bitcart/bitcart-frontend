import { QRCodeSVG } from "qrcode.react"

type ScanTabProps = {
  paymentUrl: string
}

export const ScanTab = ({ paymentUrl }: ScanTabProps) => {
  return (
    <div className="px-4 py-4 flex justify-center">
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG value={paymentUrl} size={240} level="M" />
      </div>
    </div>
  )
}
