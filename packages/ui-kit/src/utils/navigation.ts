import { evolve, filter } from "remeda"

import type {
  NavigationDirectory,
  NavigationGroup,
  NavigationLink,
  RootLayoutRegionDesignation,
} from "@/types"

const createNavigationGroupFilter =
  (targetLayoutRegion: RootLayoutRegionDesignation) => (group: NavigationGroup) => {
    switch (targetLayoutRegion) {
      case "footer": {
        return "menuOnly" in group ? !group.menuOnly : true
      }

      case "header": {
        return "footerOnly" in group ? !group.footerOnly : true
      }

      default: {
        return true
      }
    }
  }

export const getLayoutRegionNavigationDirectory = (
  targetLayoutRegion: RootLayoutRegionDesignation,
  globalDirectory: NavigationDirectory,
): NavigationDirectory => {
  const groupFilter = createNavigationGroupFilter(targetLayoutRegion)

  return evolve(globalDirectory, {
    labeledLinks: (linkGroup) => filter(linkGroup, groupFilter),
    iconLinks: (linkGroup) => filter(linkGroup, groupFilter),
  })
}

export const getNavigationLinkFlexOrder = (navLink: Partial<NavigationLink>): number | undefined =>
  "globalPosition" in navLink ? navLink.globalPosition : undefined
