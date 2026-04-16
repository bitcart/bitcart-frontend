import { evolve, filter, flatMap, piped, prop, sortBy } from "remeda"

import type {
  AnyLabeledNavigationLink,
  NavigationCatalog,
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

export const orderLinksByGlobalPriority = <T extends NavigationLink>(links: readonly T[]): T[] =>
  sortBy(links, (link) =>
    "globalPriority" in link ? link.globalPriority : Number.POSITIVE_INFINITY,
  )

/**
 * Extracts links from navigation groups into flat arrays ordered by global priority,
 * while preserving segregation by link type
 */
export const extractNavigationCatalog = (
  navigationDirectory: NavigationDirectory,
): NavigationCatalog =>
  evolve(navigationDirectory, {
    labeledLinks: piped<
      NavigationDirectory["labeledLinks"],
      AnyLabeledNavigationLink[],
      AnyLabeledNavigationLink[]
    >(flatMap(prop("items")), orderLinksByGlobalPriority),

    iconLinks: (navGroups?) => navGroups?.flatMap(piped(prop("items"), orderLinksByGlobalPriority)),
  })
