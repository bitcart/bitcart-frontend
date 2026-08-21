import {
  type BCP47LanguageSubtag,
  type PosixLocaleIdMap,
  type SourceLocaleId,
} from "@bitcart/core/i18n"
import {
  getDocumentHeadManifest,
  type DocumentFavicon,
  type DocumentViewportParams,
} from "@bitcart/core/metadata"
import type { TwitterHandle } from "@bitcart/core/types"
import { useMemo } from "react"
import { usePageContext } from "vike-react/usePageContext"

import { renderDocumentHeadManifest } from "./utils"

export type HeadProps<TSupportedLocaleId extends BCP47LanguageSubtag> = {
  favicon?: DocumentFavicon
  ogSiteName: string
  posixLocaleIdMap: PosixLocaleIdMap<TSupportedLocaleId | SourceLocaleId>
  twitterHandles?: { author?: TwitterHandle; site?: TwitterHandle }
  viewportParams?: DocumentViewportParams
}

export const createHead = <TSupportedLocaleId extends BCP47LanguageSubtag>({
  favicon,
  ogSiteName,
  posixLocaleIdMap,
  twitterHandles,
  viewportParams,
}: HeadProps<TSupportedLocaleId>) =>
  function Head(): React.JSX.Element {
    const { metadata, urlLogical } = usePageContext()

    const manifest = getDocumentHeadManifest({
      favicon,
      isCharsetSetElsewhere: true,
      isOgTitleSetElsewhere: true,
      isRoutingLocaleDependent: true,
      metadata,
      ogSiteName,
      posixLocaleIdMap,
      routePath: urlLogical,
      twitterHandles,
      viewportParams,
    })

    const metadataJsonInnerHtml = useMemo(
      () => ({
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Bitcart",
          url: "https://bitcart.ai",

          sameAs: [
            "https://twitter.com/BitcartCC",
            "https://github.com/bitcart",
            "https://reddit.com/r/Bitcart",
            "https://linkedin.com/company/bitcart",
            "https://instagram.com/bitcartcc",
          ],
        }),
      }),

      [],
    )

    return (
      <>
        {/*
          On a hard reload of a hashed URL, browsers compete the
          session-history scroll restore with the fragment scroll, producing
          a visible jump-to-anchor-then-back blink. We opt out of session
          restoration when a hash is present and scroll to the anchor
          ourselves on DOMContentLoaded, which makes the browser skip its native
          fragment scroll once `scrollRestoration` is `'manual'`. Non-hashed URLs
          keep the default `'auto'` behavior, so refresh-on-scrolled-page
          still restores the prior position.

          We also hide `<html>` until our scroll has run, which masks the
          flash on engines (e.g. Orion iOS) that still session-restore
          briefly before honoring `scrollRestoration = 'manual'`.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: /* js */ `
              if (location.hash && "scrollRestoration" in history) {
                history.scrollRestoration = "manual";
                document.documentElement.style.visibility = "hidden";

                const show = function () {
                  document.documentElement.style.visibility = "";
                };

                addEventListener("DOMContentLoaded", function () {
                  try {
                    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
                  } finally {
                    show();
                  }
                });

                setTimeout(show, 2000);
              }
            `
              .replace(/\s+/g, " ")
              .trim(),
          }}
        />

        {renderDocumentHeadManifest(manifest)}

        <script type="application/ld+json" dangerouslySetInnerHTML={metadataJsonInnerHtml} />
      </>
    )
  }
