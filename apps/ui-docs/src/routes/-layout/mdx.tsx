import defaultMdxComponents from "@fumadocs/base-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { ComponentShowcase, VariantGalleryRoot } from "@/common/ui/components"

import { StoryLayoutContextProvider } from "../-story-layout/providers/story-layout-context"
import { LayoutContextCallout } from "./components/layout-context-callout"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,

    //* Story components available in every MDX document without explicit imports:
    ComponentShowcase,
    LayoutContextCallout,
    StoryLayoutContextProvider,
    VariantGalleryRoot,

    ...components,
  } satisfies MDXComponents
}

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
