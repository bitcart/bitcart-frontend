import { CHECKOUT_PREVIEW_STATUSES, type CheckoutPreviewStatus } from "@bitcart/qa"
import { Link } from "@tanstack/react-router"

import { CHECKOUT_PALETTE_PRESET_IDS } from "#/checkout/theme/palette"
import type { CheckoutPalettePresetId } from "#/checkout/theme/presets"

//! A developer tool, never shown to customers: option ids are used as labels.

type PreviewSearch = { status: CheckoutPreviewStatus; palette?: CheckoutPalettePresetId }

//* The router marks the link matching the current search as active, `aria-current` included.
//* `explicitUndefined` keeps "default" active only while no palette is set.
const Option = ({ label, search }: { label: string; search: Partial<PreviewSearch> }) => (
  <Link
    from="/preview/$templateId"
    search={(previous) => ({ ...previous, ...search })}
    activeOptions={{ explicitUndefined: true }}
    className="border-border px-3 py-1 text-xs font-medium rounded-full border transition-colors"
    activeProps={{ className: "border-primary bg-primary text-primary-foreground" }}
    inactiveProps={{ className: "bg-card text-muted-foreground hover:bg-muted" }}
  >
    {label}
  </Link>
)

export const PreviewOptions = () => (
  <div className="max-w-md gap-2 flex w-full flex-col">
    <nav aria-label="Preview status" className="gap-1.5 flex flex-wrap">
      {CHECKOUT_PREVIEW_STATUSES.map((option) => (
        <Option key={option} label={option} search={{ status: option }} />
      ))}
    </nav>

    <nav aria-label="Preview palette" className="gap-1.5 flex flex-wrap">
      <Option label="default" search={{ palette: undefined }} />

      {CHECKOUT_PALETTE_PRESET_IDS.map((option) => (
        <Option key={option} label={option} search={{ palette: option }} />
      ))}
    </nav>
  </div>
)
