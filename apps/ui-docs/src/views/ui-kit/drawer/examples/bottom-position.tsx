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

const PAYMENT_METHODS = ["Bitcoin", "Lightning", "Ethereum", "Monero"]

export const BottomPositionDrawerExample: React.FC = () => (
  <Drawer position="bottom">
    <DrawerTrigger render={<Button variant="outline" />}>Payment methods</DrawerTrigger>

    <DrawerPopup>
      <DrawerHeader>
        <DrawerTitle>Payment methods</DrawerTitle>

        <DrawerDescription>
          Pick which of the connected wallets this store offers at checkout.
        </DrawerDescription>
      </DrawerHeader>

      <DrawerPanel>
        <ul className="gap-2 text-sm flex flex-col">
          {PAYMENT_METHODS.map((method) => (
            <li key={method} className="border-border rounded-md px-4 py-2 border">
              {method}
            </li>
          ))}
        </ul>
      </DrawerPanel>

      <DrawerFooter>
        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
        <DrawerClose render={<Button />}>Save</DrawerClose>
      </DrawerFooter>
    </DrawerPopup>
  </Drawer>
)
