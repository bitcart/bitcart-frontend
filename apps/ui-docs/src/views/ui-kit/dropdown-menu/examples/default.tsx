import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@bitcart/ui-kit/components"
import { CopyIcon, ExternalLinkIcon, Trash2Icon } from "lucide-react"

export const DefaultDropdownMenuExample: React.FC = () => (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="outline" />}>Invoice actions</DropdownMenuTrigger>

    <DropdownMenuContent className="w-56">
      <DropdownMenuGroup>
        {/*! `DropdownMenuLabel` renders a Base UI group label, so it only works inside a
            `DropdownMenuGroup` or a `DropdownMenuRadioGroup`. */}
        <DropdownMenuLabel>Invoice #1042</DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/*! `nativeButton` defaults to `true`, which Base UI only accepts when a native
            button is supplied through `render`. Plain items have to opt out of it. */}
        <DropdownMenuItem nativeButton={false}>
          <CopyIcon />
          Copy payment link
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem nativeButton={false}>
          <ExternalLinkIcon />
          Open in explorer
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem nativeButton={false} variant="destructive">
        <Trash2Icon />
        Void invoice
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
