import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import { type BCP47LanguageSubtag, type PosixLocaleIdLike } from "@bitcart/core/utils"
import { useMemo } from "react"
import { Fragment } from "react/jsx-runtime"
import { usePageContext } from "vike-react/usePageContext"

export type HeadProps<TSupportedLocaleId extends BCP47LanguageSubtag> = {
  posixLocaleIdMap: Record<TSupportedLocaleId, PosixLocaleIdLike<TSupportedLocaleId>>
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
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
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

        {Object.entries<PosixLocaleIdLike<TSupportedLocaleId>>(posixLocaleIdMap)
          .filter(([_localeId, posixLocaleId]) => posixLocaleId !== metadata.locale)
          .map(([localeId, posixLocaleId]) => (
            <Fragment key={localeId}>
              <meta property="og:locale:alternate" content={posixLocaleId} />

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
          ))}

        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={metadataJsonInnerHtml} />
      </>
    )
  }
