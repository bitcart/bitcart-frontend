import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Popover,
  DrawerPopup,
  PopoverContent,
  DrawerPanel,
  PopoverTrigger,
} from "@bitcart/ui-kit/components"
import { useCurrentBreakpoint } from "@bitcart/ui-kit/hooks"
import { useLingui } from "@lingui/react/macro"
import { Filter } from "lucide-react"
import { useMemo, useState } from "react"

import type { CatalogLookup } from "../types"
import { CatalogFilterControls } from "./filter-controls"

export type CatalogFilterProps = {
  controls: CatalogLookup["filterControls"]
  state: CatalogLookup["filters"]
}

export const CatalogFilter: React.FC<CatalogFilterProps> = ({ controls, state }) => {
  const { t } = useLingui()
  const currentBreakpoint = useCurrentBreakpoint()
  const [open, setOpen] = useState(false)

  const controlPanel = useMemo(
    () => <CatalogFilterControls filterState={state} handlers={controls} />,
    [controls, state],
  )

  switch (currentBreakpoint) {
    case "sm": {
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger render={<Button size="lg" variant="secondary" />}>
            <Filter />
            <span>{t`Filters`}</span>
          </DrawerTrigger>

          <DrawerPopup>
            <DrawerHeader className="text-center">
              <DrawerTitle>{t`Filters`}</DrawerTitle>
            </DrawerHeader>

            <DrawerPanel>{controlPanel}</DrawerPanel>
          </DrawerPopup>
        </Drawer>
      )
    }

    default: {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger render={<Button size="lg" variant="secondary" />}>
            <Filter />
            <span>{t`Filters`}</span>
          </PopoverTrigger>

          <PopoverContent className="w-80 pt-5">{controlPanel}</PopoverContent>
        </Popover>
      )
    }
  }
}
