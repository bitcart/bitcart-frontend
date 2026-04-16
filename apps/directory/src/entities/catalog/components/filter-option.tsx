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

    <Badge
      variant={isActive ? "default" : "secondary"}
      className={cn("ml-auto", { "bg-primary/70": isActive })}
      aria-hidden="true"
    >
      {badgeLabel}
    </Badge>
  </Button>
)
