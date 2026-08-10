import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@bitcart/ui-kit/components"

export const DefaultDialogExample: React.FC = () => (
  <Dialog>
    <DialogTrigger render={<Button variant="outline" />}>Refund invoice</DialogTrigger>

    <DialogContent>
      <DialogHeader>
        <DialogTitle>Refund invoice #1042</DialogTitle>

        <DialogDescription>
          0.0241 BTC will be returned to the address that paid this invoice. Refunds cannot be
          reversed once broadcast.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <DialogClose render={<Button variant="destructive" />}>Refund</DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
