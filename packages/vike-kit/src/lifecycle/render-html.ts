import { onRenderHtml as renderWithVikeReact } from "vike-react/__internal/integration/onRenderHtml"
import type { Config } from "vike/types"

const PRELOADED_FONT_FILE_NAME = "inter-latin-opsz-normal"

/**
 * vike-react's renderer, plus the `injectFilter` it leaves no way to set.
 *
 * Vike preloads every font file a stylesheet references, which downloads each subset of a
 * `unicode-range` split whether the page needs it or not. Only the Latin one is preloaded here: the
 * browser fetches any other once the page's text asks for it.
 */
export const onRenderHtml: Config["onRenderHtml"] = async (pageContext) => ({
  documentHtml: await renderWithVikeReact(pageContext),

  injectFilter: (assets) => {
    for (const asset of assets) {
      if (asset.assetType === "font" && !asset.src.includes(PRELOADED_FONT_FILE_NAME)) {
        asset.inject = false
      }
    }
  },
})
