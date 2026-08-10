import { Kbd, KbdGroup } from "@bitcart/ui-kit/components"

export const DefaultKbdExample: React.FC = () => (
  <div className="gap-4 flex flex-col items-center">
    <div className="gap-2 flex items-center">
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>Ctrl</Kbd>
      <Kbd>Alt</Kbd>
    </div>

    <div className="text-muted-foreground gap-2 text-sm flex items-center">
      <span>Open the command palette with</span>

      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  </div>
)
