import { docs } from "collections/server"
import { loader } from "fumadocs-core/source"
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons"

import { APP_CONTENT_ROOT_ROUTE } from "./common/constants"

export const contentSource = loader({
  source: docs.toFumadocsSource(),
  baseUrl: APP_CONTENT_ROOT_ROUTE,
  plugins: [lucideIconsPlugin()],
})

export async function getLLMText(page: (typeof contentSource)["$inferPage"]) {
  const processed = await page.data.getText("processed")

  return `# ${page.data.title} (${page.url})\n\n${processed}`
}
