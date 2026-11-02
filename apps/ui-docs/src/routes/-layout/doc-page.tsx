import { createPagePreloader } from "@bitcart/tanstack-start-kit/fumadocs"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "@fumadocs/base-ui/layouts/docs/page"
import browserCollections from "collections/browser"

import {
  APP_CONTENT_ROOT_ROUTE,
  APP_SOURCE_PUBLIC_REPO_CONTENT_DIRECTORY,
} from "@/common/constants"

import { getMDXComponents } from "./mdx"

export type DocPageProps = {
  markdownUrl: string
  path: string
}

export const docPageLoader = browserCollections.docs.createClientLoader({
  component: ({ toc, frontmatter, default: MDX }, { markdownUrl, path }: DocPageProps) => (
    <DocsPage toc={toc}>
      <DocsTitle>{frontmatter.title}</DocsTitle>
      <DocsDescription>{frontmatter.description}</DocsDescription>

      <div className="-mt-4 gap-2 pb-6 flex flex-row items-center border-b">
        <MarkdownCopyButton markdownUrl={markdownUrl} />

        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`${APP_SOURCE_PUBLIC_REPO_CONTENT_DIRECTORY}/${path}`}
        />
      </div>

      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  ),
})

export const preloadDocPageAt = createPagePreloader(
  browserCollections.docs,
  docPageLoader,
  APP_CONTENT_ROOT_ROUTE,
)
