import { defineConfig, defineDocs } from "fumadocs-mdx/config"

export const docs = defineDocs({
  dir: "content/docs",

  docs: {
    //* When set to `true` keeps MDX bodies out of the eager server glob,
    //* making a cold start only compile the requested page instead of every doc
    //* (and every story file each doc imports).
    async: true,

    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
})

export default defineConfig()
