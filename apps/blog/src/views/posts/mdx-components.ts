import type { MDXComponents } from "mdx/types"

import { Figure, Gallery, H2, H3, Pre, ProseLink, VideoFigure, YouTubeFigure } from "./mdx-elements"

export const MDX_COMPONENTS = {
  Figure,
  Gallery,
  VideoFigure,
  YouTubeFigure,
  a: ProseLink,
  h2: H2,
  h3: H3,
  pre: Pre,
} satisfies MDXComponents
