import { Button } from "@bitcart/ui-kit/components"
import { DocsLayout } from "@fumadocs/base-ui/layouts/docs"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "@fumadocs/base-ui/layouts/docs/page"
import { GithubLogoIcon } from "@phosphor-icons/react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions"
import browserCollections from "collections/browser"
import { useFumadocsLoader } from "fumadocs-core/source/client"
import { Suspense } from "react"

import {
  APP_SOURCE_PUBLIC_REPO_CONTENT_DIRECTORY,
  APP_SOURCE_PUBLIC_REPO_DIRECTORY,
} from "@/common/constants"
import { LocaleSelector, ThemeSelector } from "@/common/ui/components"
import { slugsToMarkdownPath } from "@/common/utils"
import { contentSource } from "@/content"
import { getBaseLayoutProps } from "@/routes/-layout/config"
import { getMDXComponents } from "@/routes/-layout/mdx"

export const Route = createFileRoute("/$")({
  component: Page,

  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? []
    const data = await loader({ data: slugs })

    await clientLoader.preload(data.path)

    return data
  },
})

const loader = createServerFn({
  method: "GET",
})
  .validator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = contentSource.getPage(slugs)

    if (page) {
      return {
        path: page.path,
        markdownUrl: slugsToMarkdownPath(page.slugs).url,
        pageTree: await contentSource.serializePageTree(contentSource.getPageTree()),
      }
    } else throw notFound() as Error
  })

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: MDX },

    //* Props
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string
      path: string
    },
  ) {
    return (
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
    )
  },
})

function Page() {
  const { pageTree, path, markdownUrl } = useFumadocsLoader(Route.useLoaderData())

  return (
    <DocsLayout
      sidebar={{
        banner: (
          <div className="gap-3 flex flex-col">
            <LocaleSelector />
            <ThemeSelector />
          </div>
        ),

        footer: (
          <div className="gap-3 flex flex-col">
            <Button
              render={
                <a
                  href={APP_SOURCE_PUBLIC_REPO_DIRECTORY}
                  rel="noreferrer"
                  target="_blank"
                  aria-label="GitHub"
                />
              }
              nativeButton={false}
              size="icon-lg"
              variant="ghost"
              className="hover:text-accent-foreground bg-muted/25 dark:hover:bg-accent/30"
            >
              <GithubLogoIcon aria-hidden="true" />
            </Button>
          </div>
        ),
      }}
      {...getBaseLayoutProps()}
      tree={pageTree}
    >
      <Link to={markdownUrl} hidden />
      <Suspense>{clientLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  )
}
