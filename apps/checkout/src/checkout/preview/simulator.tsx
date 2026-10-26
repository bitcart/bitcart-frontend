import { Badge, Button, ButtonGroupText, ToggleGroupItem } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"

import { PREVIEW_CONNECTIONS, type PreviewAction, type PreviewConnection } from "./simulation"
import { PreviewToggleGroup } from "./toolbar"

//! A developer tool, never shown to customers: labels are English and not translated.

export const PreviewSimulator = ({
  actions,
  onAction,
  connection,
  onConnectionChange,
  isSimulated,
  onReset,
}: {
  actions: PreviewAction[]
  onAction: (action: PreviewAction) => void
  connection: PreviewConnection
  onConnectionChange: (connection: PreviewConnection) => void
  isSimulated: boolean
  onReset: () => void
}) => (
  <section
    aria-label="Simulate"
    className={cn(`
      gap-2 max-w-3xl p-2 rounded-xl border-border bg-card flex w-full flex-wrap items-center
      justify-center border
    `)}
  >
    <ButtonGroupText>Simulate</ButtonGroupText>

    {actions.map((action) => (
      <Button key={action.label} variant="outline" size="sm" onClick={() => onAction(action)}>
        {action.label}
      </Button>
    ))}

    {actions.length === 0 && (
      <span className="text-xs text-muted-foreground">Nothing else happens to this invoice</span>
    )}

    <PreviewToggleGroup
      aria-label="Connection"
      value={[connection]}
      onValueChange={([selected]) => {
        const next = PREVIEW_CONNECTIONS.find((option) => option === selected)

        if (next) onConnectionChange(next)
      }}
    >
      <ButtonGroupText>Connection</ButtonGroupText>

      {PREVIEW_CONNECTIONS.map((option) => (
        <ToggleGroupItem key={option} value={option}>
          {option}
        </ToggleGroupItem>
      ))}
    </PreviewToggleGroup>

    {isSimulated && (
      <>
        <Badge variant="secondary">simulated</Badge>

        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </>
    )}
  </section>
)
