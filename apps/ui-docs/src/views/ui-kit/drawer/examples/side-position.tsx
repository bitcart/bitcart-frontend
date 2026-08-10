import {
  Button,
  Drawer,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@bitcart/ui-kit/components"

const INVOICE_EVENTS = [
  { at: "12:04", label: "Invoice created", amount: "0.0125 BTC" },
  { at: "12:07", label: "Payment detected", amount: "0.0125 BTC" },
  { at: "12:09", label: "1 confirmation", amount: "" },
  { at: "12:31", label: "Settled", amount: "0.0125 BTC" },
]

export const SidePositionDrawerExample: React.FC = () => (
  <Drawer position="right">
    <DrawerTrigger render={<Button variant="outline" />}>Invoice details</DrawerTrigger>

    <DrawerPopup>
      <DrawerHeader>
        <DrawerTitle>Invoice #1042</DrawerTitle>

        <DrawerDescription>
          Full payment timeline for this order, including on-chain confirmations.
        </DrawerDescription>
      </DrawerHeader>

      <DrawerPanel>
        <ul className="gap-2 text-sm flex flex-col">
          {INVOICE_EVENTS.map((event) => (
            <li
              key={event.at}
              className="
                border-border rounded-md px-4 py-2 gap-4 flex items-center justify-between border
              "
            >
              <span className="gap-3 flex items-baseline">
                <span className="text-muted-foreground font-mono text-xs">{event.at}</span>
                {event.label}
              </span>

              <span className="text-muted-foreground font-mono text-xs">{event.amount}</span>
            </li>
          ))}
        </ul>
      </DrawerPanel>

      <DrawerFooter>
        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        <DrawerClose render={<Button />}>Refund</DrawerClose>
      </DrawerFooter>
    </DrawerPopup>
  </Drawer>
)
