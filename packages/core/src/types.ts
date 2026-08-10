export { type infer as FromSchema } from "zod"

export type RuntimeEnvTag = "testing" | "development" | "production"

export type InternalHref = `/${string}` | `#${string}` | `?${string}`

export type HttpHref = `http://${string}` | `https://${string}` | `//${string}`

export type MailtoHref = `mailto:${string}`

export type TelHref = `tel:${string}`

export type ExternalHref = HttpHref | MailtoHref | TelHref

export type A11yAwareLinkProps =
  | { href: InternalHref | MailtoHref; target?: string; a11yHint?: string }
  | { href: InternalHref | HttpHref; target: "_blank"; a11yHint: string }
  | {
      href: HttpHref

      /**
       * Must be set to `_blank` by Vike Kit's Link component
       */
      target?: string
      a11yHint: string
    }

export type DestinationTypeAwareLinkInputs = { href: string; isOriginAware?: boolean }

export type DestinationTypeAwareLinkProps = { target: "_blank"; rel: "noopener" } | {}

/**
 * Framework-agnostic client route bindings.
 */
export type ClientRoute = {
  /**
   * Only available on the client, will be `null` on the server.
   */
  hash: string | null

  /**
   * The current route path without parameters and the hash fragment.
   */
  pathname: InternalHref

  /**
   * {@link ClientRoute.pathname} appended with the hash fragment.
   */
  pathnameWithHash: InternalHref
}
