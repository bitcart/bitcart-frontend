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
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        languageAttributeTransformer,
      ],
    },
  },
})
