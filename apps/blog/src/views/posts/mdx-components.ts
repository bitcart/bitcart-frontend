import type { MDXComponents } from "mdx/types"

import { Figure, Gallery, Pre, ProseLink, VideoFigure, YouTubeFigure } from "./mdx-elements"

export const MDX_COMPONENTS = {
  Figure,
  Gallery,
  VideoFigure,
  YouTubeFigure,
  a: ProseLink,
  pre: Pre,
} satisfies MDXComponents
