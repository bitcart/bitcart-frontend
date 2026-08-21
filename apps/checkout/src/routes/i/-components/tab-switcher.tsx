import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"

type TabSwitcherProps = {
  activeTab: "scan" | "copy"
  onTabChange: (tab: "scan" | "copy") => void
}

export const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  return (
    <div className="flex">
      <button
        type="button"
        className={cn(`
          py-2.5 text-sm font-medium flex-1 border-b-2 text-center transition-colors
          ${
            activeTab === "scan"
              ? "border-green-600 text-green-600"
              : `text-muted-foreground border-transparent`
          }
        `)}
        onClick={() => onTabChange("scan")}
      >
        {t`SCAN`}
      </button>
      <button
        type="button"
        className={cn(`
          py-2.5 text-sm font-medium flex-1 border-b-2 text-center transition-colors
          ${
            activeTab === "copy"
              ? "border-green-600 text-green-600"
              : `text-muted-foreground border-transparent`
          }
        `)}
        onClick={() => onTabChange("copy")}
      >
        {t`COPY`}
      </button>
    </div>
  )
}
