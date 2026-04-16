import type { InternalHref } from "@bitcart/core/types"
import type { Url } from "vike/types"

export type RouteUrl = Url & {
  href: InternalHref
}
