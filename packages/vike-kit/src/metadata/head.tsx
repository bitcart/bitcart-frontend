import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import {
  type BCP47LanguageSubtag,
  type PosixLocaleIdLike,
  type PosixLocaleIdMap,
} from "@bitcart/core/utils"
import { useMemo } from "react"
import { Fragment } from "react/jsx-runtime"
import { usePageContext } from "vike-react/usePageContext"

export type HeadProps<TSupportedLocaleId extends BCP47LanguageSubtag> = {
  posixLocaleIdMap: PosixLocaleIdMap<TSupportedLocaleId>
  projectCanonicalName: string
}

export const createHead = <TSupportedLocaleId extends BCP47LanguageSubtag>({
  posixLocaleIdMap,
  projectCanonicalName,
}: HeadProps<TSupportedLocaleId>) =>
  function Head() {
    const { metadata, urlLogical } = usePageContext()
    const normalizedUrl = urlLogical === "/" ? "" : urlLogical

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

        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />

        <meta name="description" content={metadata.description} />
        <meta name="og:description" content={metadata.description} />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="author" content={metadata.author} />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={projectCanonicalName} />
        <meta property="og:locale" content={metadata.locale} />
        <meta property="og:image" content={metadata.image.src} />
        <meta property="og:image:alt" content={metadata.image.alt} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content={metadata.image.width} />
        <meta property="og:image:height" content={metadata.image.height} />

        {metadata.image.secureUrl && (
          <meta property="og:image:secure_url" content={metadata.image.secureUrl} />
        )}

        {metadata.image.secureUrl && (
          <>
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:image" content={metadata.image.secureUrl} />
            <meta name="twitter:image:alt" content={metadata.image.alt} />
          </>
        )}

        <meta name="twitter:site" content="@BitcartCC" />
        <meta name="twitter:creator" content="@BitcartCC" />

        <link rel="canonical" href={metadata.url} />

        {Object.entries<PosixLocaleIdLike<TSupportedLocaleId>>(posixLocaleIdMap).map(
          ([localeId, posixLocaleId]) => (
            <Fragment key={localeId}>
              {posixLocaleId !== metadata.locale && (
                <meta property="og:locale:alternate" content={posixLocaleId} />
              )}

              <link
                rel="alternate"
                href={
                  localeId === SOURCE_LOCALE_ID
                    ? `${metadata.baseUrl}${normalizedUrl}`
                    : `${metadata.baseUrl}/${localeId}${normalizedUrl}`
                }
                hrefLang={localeId}
                type="text/html"
              />
            </Fragment>
          ),
        )}

        <link
          rel="alternate"
          href={`${metadata.baseUrl}${normalizedUrl}`}
          hrefLang="x-default"
          type="text/html"
        />

        <script type="application/ld+json" dangerouslySetInnerHTML={metadataJsonInnerHtml} />
      </>
    )
  }
