import { useIsClient } from "@bitcart/hooks"
import { Button, ThemeToggle, ThemeToggleFallback } from "@bitcart/ui-kit/components"
import { DocsLayout } from "@fumadocs/base-ui/layouts/docs"
import { GithubLogoIcon } from "@phosphor-icons/react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions"
import { useFumadocsLoader } from "fumadocs-core/source/client"
import { Suspense } from "react"

import { APP_SOURCE_PUBLIC_REPO_DIRECTORY } from "@/common/constants"
import { LocaleSelector } from "@/common/ui/components"
import { slugsToMarkdownPath } from "@/common/utils"
import { contentSource } from "@/content"
import { getBaseLayoutProps } from "@/routes/-layout/config"
import { docPageLoader } from "@/routes/-layout/doc-page"

export const Route = createFileRoute("/$")({
  component: Page,

  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? []
    const data = await loader({ data: slugs })

    await docPageLoader.preload(data.path)

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

function Page() {
  const { pageTree, path, markdownUrl } = useFumadocsLoader(Route.useLoaderData())
  const isClient = useIsClient()

  return (
    <DocsLayout
      sidebar={{
        banner: (
          <div className="gap-3 flex">
            <LocaleSelector />
            {isClient ? (
              <ThemeToggle triggerProps={{ variant: "outline" }} />
            ) : (
              <ThemeToggleFallback />
            )}
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
              className="hover:text-primary-text bg-muted/25 dark:hover:bg-accent/30"
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
      <Suspense>{docPageLoader.useContent(path, { markdownUrl, path })}</Suspense>
    </DocsLayout>
  )
}
