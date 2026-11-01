import { Badge, Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"

export type CatalogFilterOptionProps = {
  isActive: boolean
  icon: React.ReactNode
  label: string
  badgeLabel: string | number
  onClick: VoidFunction
}

export const CatalogFilterOption: React.FC<CatalogFilterOptionProps> = ({
  isActive,
  icon,
  label,
  badgeLabel,
  onClick,
}) => (
  <Button
    variant={isActive ? "accent" : "ghost"}
    onClick={onClick}
    aria-pressed={isActive}
    aria-label={`${label} (${badgeLabel})`}
    className={cn(
      `important:px-3 w-full justify-between transition-none focus-visible:ring-transparent`,

      {
        "text-foreground": isActive,
      },
    )}
  >
    {icon}

    <span className="flex-1 text-left" aria-hidden="true">
      {label}
    </span>

    {isActive ? (
      <Badge className="min-w-6 ml-auto tabular-nums" aria-hidden="true">
        {badgeLabel}
      </Badge>
    ) : (
      <span
        className="px-2 text-sm font-medium text-muted-foreground min-w-6 ml-auto text-center tabular-nums"
        aria-hidden="true"
      >
        {badgeLabel}
      </span>
    )}
  </Button>
)
