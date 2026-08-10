import { defineStoryFactory, type StoryOptions } from "@fumadocs/story/vite/client"

import { StoryCanvas } from "./components"

const { defineStory: defineStoryBase } = defineStoryFactory()

export const defineStory = <C extends React.FC<any>>({ Component, ...options }: StoryOptions<C>) =>
  defineStoryBase({
    ...options,

    Component: ((props: React.ComponentProps<C>) => (
      <StoryCanvas>
        <Component {...props} />
      </StoryCanvas>
    )) as C,
  })
