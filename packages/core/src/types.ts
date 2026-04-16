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
