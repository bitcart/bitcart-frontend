import { FittedText } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"

const STEPS = [
  {},
  { fontSize: "1.5rem", lineHeight: "2rem" },
  { fontSize: "1.25rem", lineHeight: "1.75rem" },
]

export const DefaultFittedTextExample: React.FC = () => (
  <div
    className={cn(`
      w-72 p-4 rounded-lg border-border min-w-32 max-w-full resize-x overflow-hidden border
    `)}
  >
    <FittedText steps={STEPS}>
      <span className="text-3xl font-bold tracking-tight block whitespace-nowrap tabular-nums">
        1,234,567.89 <span className="text-muted-foreground text-base font-medium">USDT</span>
      </span>
    </FittedText>
  </div>
)
