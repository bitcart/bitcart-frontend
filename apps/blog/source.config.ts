import {
  rehypeCodeDefaultOptions,
  type RehypeCodeOptions,
} from "fumadocs-core/mdx-plugins/rehype-code"
import { defineCollections, defineConfig } from "fumadocs-mdx/config"

import { postFrontmatterSchema } from "./src/common/content/schema.ts"

export const posts = defineCollections({
  type: "doc",
  dir: "content/posts",
  schema: postFrontmatterSchema,

  postprocess: {
    includeProcessedMarkdown: true,
  },
})

//* The code block header shows the language, which Shiki otherwise leaves only in a class name.
const languageAttributeTransformer: NonNullable<RehypeCodeOptions["transformers"]>[number] = {
  name: "blog:language-attribute",

  pre(node) {
    node.properties["data-language"] = this.options.lang
  },
}

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      themes: { light: "github-light-default", dark: "github-dark-default" },

      //* Primer's newer muted gray: the theme's comment color falls short of 4.5:1 on code blocks.
      colorReplacements: { "github-light-default": { "#6e7781": "#59636e" } },

      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        languageAttributeTransformer,
      ],
    },
  },
})
