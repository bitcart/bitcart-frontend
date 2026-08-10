import { LayoutContextProvider } from "@bitcart/ui-kit/providers"

import { StoryLink } from "@/common/ui/components"

import { STORY_LAYOUT_CONTEXT_ROUTE_STUB } from "../constants"
import { getStoryLayoutConfig } from "../layout.config"

export type StoryLayoutContextProviderProps = {
  children: React.ReactNode
}

export const StoryLayoutContextProvider: React.FC<StoryLayoutContextProviderProps> = ({
  children,
}) => (
  <LayoutContextProvider
    LinkComponent={StoryLink}
    currentRoute={STORY_LAYOUT_CONTEXT_ROUTE_STUB}
    layoutConfig={getStoryLayoutConfig()}
  >
    {children}
  </LayoutContextProvider>
)
