import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@bitcart/ui-kit/components"
import { useCurrentBreakpoint } from "@bitcart/ui-kit/hooks"
import { useLingui } from "@lingui/react/macro"
import { Filter } from "lucide-react"
import { useState } from "react"

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

  switch (currentBreakpoint) {
    case "sm": {
      return (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button size="lg" variant="secondary">
              <Filter className="size-5" />
              <span>{t`Filters`}</span>
            </Button>
          </DrawerTrigger>

          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t`Filters`}</DrawerTitle>
            </DrawerHeader>

            <CatalogFilterControls
              filterState={state}
              handlers={controls}
              className="p-4 pt-0 mb-4"
            />
          </DrawerContent>
        </Drawer>
      )
    }

    default: {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger render={<Button size="lg" variant="secondary" />}>
            <Filter className="size-5" />
            <span>{t`Filters`}</span>
          </PopoverTrigger>

          <PopoverContent className="w-80 p-3 pt-4">
            <CatalogFilterControls filterState={state} handlers={controls} />
          </PopoverContent>
        </Popover>
      )
    }
  }
}
