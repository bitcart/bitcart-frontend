import { describe, expect, test } from "vitest"

import type { StaticDocumentMetadata } from "./types"
import {
  getBlogJsonLd,
  getBlogPostingJsonLd,
  getBreadcrumbListJsonLd,
  getDocumentHeadManifest,
  getJsonLdScript,
} from "./utils"

const PUBLISHER = { name: "Bitcart", url: "https://bitcart.ai" }

describe("getBlogPostingJsonLd", () => {
  test("links the post to its author, publisher and blog", () => {
    expect(
      getBlogPostingJsonLd({
        url: "https://blog.bitcart.ai/post",
        headline: "Post",
        description: "About the post",
        image: "https://blog.bitcart.ai/cover.png",
        datePublished: "2021-09-21",
        author: { name: "Ada", url: "https://example.com/authors/ada" },
        publisher: PUBLISHER,
        blogUrl: "https://blog.bitcart.ai",
      }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: "https://blog.bitcart.ai/post",
      url: "https://blog.bitcart.ai/post",
      headline: "Post",
      description: "About the post",
      image: "https://blog.bitcart.ai/cover.png",
      datePublished: "2021-09-21",
      author: { "@type": "Person", name: "Ada", url: "https://example.com/authors/ada" },
      publisher: { "@type": "Organization", ...PUBLISHER },
      isPartOf: { "@type": "Blog", url: "https://blog.bitcart.ai" },
    })
  })

  test("adds dateModified only when the post was updated", () => {
    const params = {
      url: "https://blog.bitcart.ai/post",
      headline: "Post",
      description: "About the post",
      image: "https://blog.bitcart.ai/cover.png",
      datePublished: "2021-09-21",
      author: { name: "Ada", url: "https://example.com/authors/ada" },
      publisher: PUBLISHER,
      blogUrl: "https://blog.bitcart.ai",
    }

    expect(getBlogPostingJsonLd(params)).not.toHaveProperty("dateModified")

    expect(getBlogPostingJsonLd({ ...params, dateModified: "2022-01-01" })).toHaveProperty(
      "dateModified",
      "2022-01-01",
    )
  })
})

describe("getBlogJsonLd", () => {
  test("describes the blog and its publisher", () => {
    expect(
      getBlogJsonLd({
        url: "https://blog.bitcart.ai",
        name: "Bitcart Blog",
        description: "News",
        publisher: PUBLISHER,
      }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "Blog",
      url: "https://blog.bitcart.ai",
      name: "Bitcart Blog",
      description: "News",
      publisher: { "@type": "Organization", ...PUBLISHER },
    })
  })
})

describe("getBreadcrumbListJsonLd", () => {
  test("numbers the breadcrumbs from one", () => {
    expect(
      getBreadcrumbListJsonLd([
        { name: "Blog", url: "https://blog.bitcart.ai" },
        { name: "Releases", url: "https://blog.bitcart.ai/category/releases" },
      ]).itemListElement,
    ).toEqual([
      { "@type": "ListItem", position: 1, name: "Blog", item: "https://blog.bitcart.ai" },

      {
        "@type": "ListItem",
        position: 2,
        name: "Releases",
        item: "https://blog.bitcart.ai/category/releases",
      },
    ])
  })
})

describe("getJsonLdScript", () => {
  test("keeps a string in the data from closing the script element", () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Thing",
      name: "</script><b>",
    } as const

    const script = getJsonLdScript(jsonLd)

    expect(script.type).toBe("application/ld+json")
    expect(script.children).not.toContain("<")
    expect(JSON.parse(script.children)).toEqual(jsonLd)
  })
})

describe("getDocumentHeadManifest", () => {
  const getTwitterCard = (image: Partial<StaticDocumentMetadata["image"]>) =>
    getDocumentHeadManifest({
      isCharsetSetElsewhere: true,
      isOgTitleSetElsewhere: false,
      isRoutingLocaleDependent: false,
      ogSiteName: "Bitcart Blog",
      posixLocaleIdMap: { en: "en_US" },
      routePath: "/",

      metadata: {
        title: "Title",
        description: "Description",
        locale: "en_US",
        url: "https://blog.bitcart.ai",
        baseUrl: "https://blog.bitcart.ai",

        image: {
          src: "/cover.png",
          alt: "Cover",
          type: "image/png",
          secureUrl: "https://blog.bitcart.ai/cover.png",
          ...image,
        },
      },
    }).meta.find((tag) => tag.name === "twitter:card")?.content

  test.each([
    ["a wide image", { width: "1920", height: "1080" }, "summary_large_image"],
    ["a square image", { width: "1200", height: "1200" }, "summary"],
    ["an image without a size", {}, "summary"],
  ])("picks the X card for %s", (_, size, card) => {
    expect(getTwitterCard(size)).toBe(card)
  })

  test("leaves the X card out without an https image URL", () => {
    expect(getTwitterCard({ secureUrl: undefined })).toBeUndefined()
  })
})
