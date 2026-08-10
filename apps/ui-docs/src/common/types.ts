import type { ArgsOptions, StoryOptions } from "@fumadocs/story/vite/client"

/**
 * Extracted from private `@fumadocs/story/dist/client/with-control.d.ts`
 */
export type StoryComponentVariantInfo = {
  variant: string
  description?: string
}

export type StoryComponentVariantPresets<TComponent extends React.FC<any>> =
  StoryOptions<TComponent>["args"]

export type StoryComponentVariantPresetMap<TComponent extends React.FC<any>> = Record<
  string,
  ArgsOptions<TComponent> & StoryComponentVariantInfo
>
