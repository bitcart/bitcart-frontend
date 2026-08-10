import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandShortcut,
  Kbd,
} from "@bitcart/ui-kit/components"

type CommandEntry = {
  value: string
  label: string
  shortcut: string
}

const COMMAND_ENTRIES: CommandEntry[] = [
  { value: "new-invoice", label: "Create invoice", shortcut: "⌘N" },
  { value: "new-store", label: "Create store", shortcut: "⌘S" },
  { value: "connect-wallet", label: "Connect wallet", shortcut: "⌘W" },
  { value: "open-payouts", label: "Open payouts", shortcut: "⌘P" },
  { value: "open-settings", label: "Open settings", shortcut: "⌘," },
]

export const DefaultCommandExample: React.FC = () => (
  <Command items={COMMAND_ENTRIES}>
    <div className="bg-popover rounded-lg max-h-80 max-w-md flex w-full flex-col border">
      <CommandPanel className="min-h-0 flex flex-1 flex-col">
        <CommandInput placeholder="Search for apps and commands…" />
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandList>
          {(entry: CommandEntry) => (
            <CommandItem key={entry.value} value={entry}>
              <span>{entry.label}</span>

              <CommandShortcut>{entry.shortcut}</CommandShortcut>
            </CommandItem>
          )}
        </CommandList>
      </CommandPanel>

      <CommandFooter>
        <span>Activate</span>

        <Kbd>Enter</Kbd>
      </CommandFooter>
    </div>
  </Command>
)
