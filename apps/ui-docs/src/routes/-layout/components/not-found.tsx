import { HomeLayout } from "@fumadocs/base-ui/layouts/home"
import { DefaultNotFound } from "@fumadocs/base-ui/layouts/home/not-found"

import { getBaseLayoutProps } from "@/routes/-layout/config"

export function NotFound() {
  return (
    <HomeLayout {...getBaseLayoutProps()}>
      <DefaultNotFound />
    </HomeLayout>
  )
}
