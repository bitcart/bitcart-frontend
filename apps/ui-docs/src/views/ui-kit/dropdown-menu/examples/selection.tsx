import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@bitcart/ui-kit/components"

export const SelectionDropdownMenuExample: React.FC = () => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="outline" />}>View options</DropdownMenuTrigger>

    <DropdownMenuContent className="w-56">
      <DropdownMenuGroup>
        {/*! `DropdownMenuLabel` renders a Base UI group label, so it only works inside a
            `DropdownMenuGroup` or a `DropdownMenuRadioGroup`. */}
        <DropdownMenuLabel>Columns</DropdownMenuLabel>

        <DropdownMenuCheckboxItem defaultChecked>Amount</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem defaultChecked>Status</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Customer</DropdownMenuCheckboxItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuRadioGroup defaultValue="created">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>

        <DropdownMenuRadioItem value="created">Created</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="amount">Amount</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
)
