import type { DocumentHeadManifest } from "@bitcart/core/metadata"
import { createElement, Fragment, type ReactNode } from "react"

export const renderDocumentHeadManifest = ({ links, meta }: DocumentHeadManifest): ReactNode =>
  createElement(Fragment, null, [
    ...meta.map((attributes, index) =>
      createElement("meta", {
        ...attributes,
        key: `meta-${attributes.name ?? attributes.property ?? index}`,
      }),
    ),

    ...links.map((attributes, index) =>
      createElement("link", {
        ...attributes,
        key: `link-${attributes.rel}-${attributes.hrefLang ?? index}`,
      }),
    ),
  ])
