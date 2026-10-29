import { isHttpHref } from "@bitcart/core/navigation"

import type {
  EmbedError,
  EmbedFrameMessage,
  EmbedInvoiceState,
} from "#/common/integrations/embed/protocol"

import { startFrameSession, type FrameSession } from "./frame-session"
import { injectedCheckoutUrl } from "./injected-checkout-url"
import { navigateTo } from "./navigation"
import { stripTrailingSlashes } from "./script-base"
import { CHECKOUT_DIALOG_STYLES } from "./styles"

export const CHECKOUT_ELEMENT_TAG = "bitcart-checkout"

const FALLBACK_DELAY_MS = 8000

export type CheckoutCloseReason = "checkout" | "button" | "escape" | "fallback" | "api"

type CompletePayload = Extract<EmbedFrameMessage, { type: "complete" }>["payload"]

export type CheckoutEventMap = {
  "bitcart:ready": CustomEvent<EmbedInvoiceState>
  "bitcart:status": CustomEvent<EmbedInvoiceState>
  "bitcart:expired": CustomEvent<EmbedInvoiceState>
  "bitcart:complete": CustomEvent<CompletePayload>
  "bitcart:close": CustomEvent<{ reason: CheckoutCloseReason }>
  "bitcart:error": CustomEvent<EmbedError>
}

export const listen = <Type extends keyof CheckoutEventMap>(
  target: EventTarget,
  type: Type,
  listener: (event: CheckoutEventMap[Type]) => void,
): void => target.addEventListener(type, listener as EventListener)

const CLOSE_ICON = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
`

const TEMPLATE = `
  <style>${CHECKOUT_DIALOG_STYLES}</style>
  <dialog aria-label="Checkout">
    <div class="card">
      <button type="button" class="close" aria-label="Close">${CLOSE_ICON}</button>
      <div class="status" role="status">
        <div class="spinner"></div>
        <span class="visually-hidden">Loading checkout\u2026</span>
        <p class="fallback" hidden>
          The checkout is taking longer than usual.
          <a target="_blank" rel="noopener">Open in new tab</a>
        </p>
      </div>
    </div>
  </dialog>
`

const queryRequired = <Element extends HTMLElement>(
  root: ShadowRoot,
  selector: string,
  type: abstract new () => Element,
): Element => {
  const element = root.querySelector(selector)

  if (element instanceof type) {
    return element
  } else throw new Error(`${CHECKOUT_ELEMENT_TAG}: missing ${selector}`)
}

const createFrame = (src: string): HTMLIFrameElement => {
  const frame = document.createElement("iframe")

  frame.src = src
  frame.title = "Checkout"
  frame.allow = "clipboard-write"

  return frame
}

const lockPageScroll = (): (() => void) => {
  const { style } = document.documentElement
  const previousOverflow = style.overflow

  style.overflow = "hidden"

  return () => {
    style.overflow = previousOverflow
  }
}

const getTrustedOrigins = (invoiceUrl: string): string[] => {
  const { origin } = new URL(invoiceUrl)

  return injectedCheckoutUrl ? [origin, new URL(injectedCheckoutUrl).origin] : [origin]
}

let defaultCheckoutUrl: string | null = null

export const setDefaultCheckoutUrl = (url: string | null): void => {
  defaultCheckoutUrl = url
}

type OpenSession = {
  session: FrameSession
  frame: HTMLIFrameElement
  restorePageScroll: () => void
}

export class BitcartCheckoutElement extends HTMLElement {
  readonly #dialog: HTMLDialogElement
  readonly #fallback: HTMLParagraphElement
  readonly #fallbackLink: HTMLAnchorElement
  #current: OpenSession | null = null

  constructor() {
    super()

    const root = this.attachShadow({ mode: "open" })

    root.innerHTML = TEMPLATE
    this.#dialog = queryRequired(root, "dialog", HTMLDialogElement)
    this.#fallback = queryRequired(root, ".fallback", HTMLParagraphElement)
    this.#fallbackLink = queryRequired(root, ".fallback a", HTMLAnchorElement)

    queryRequired(root, ".close", HTMLButtonElement).addEventListener("click", () =>
      this.#close("button"),
    )

    this.#dialog.addEventListener("cancel", (event) => {
      event.preventDefault()
      this.#close("escape")
    })

    //* Opened by hand: closing removes a checkout made by `Bitcart.open()`, and a removed link
    //* doesn't navigate.
    this.#fallbackLink.addEventListener("click", (event) => {
      event.preventDefault()
      window.open(this.#fallbackLink.href, "_blank", "noopener")
      this.#close("fallback")
    })
  }

  get isOpen(): boolean {
    return this.#current !== null
  }

  open(): void {
    if (this.#current) return void null

    const invoiceId = this.getAttribute("invoice-id")
    const checkoutUrl = this.getAttribute("checkout-url") ?? defaultCheckoutUrl

    if (!this.isConnected) {
      throw new Error(`${CHECKOUT_ELEMENT_TAG}: add the element to the document before opening it`)
    } else if (!invoiceId) {
      throw new Error(`${CHECKOUT_ELEMENT_TAG}: the invoice-id attribute is required`)
    } else if (!checkoutUrl) {
      throw new Error(`${CHECKOUT_ELEMENT_TAG}: the checkout URL is unknown, set checkout-url`)
    }

    const invoiceUrl = `${stripTrailingSlashes(checkoutUrl)}/i/${encodeURIComponent(invoiceId)}`
    const frame = createFrame(`${invoiceUrl}?embed=v1`)

    this.#fallbackLink.href = invoiceUrl
    this.#fallback.hidden = true
    this.#dialog.dataset.state = "loading"
    this.#dialog.append(frame)

    this.#current = {
      frame,
      restorePageScroll: lockPageScroll(),

      session: startFrameSession({
        frame,
        origins: getTrustedOrigins(invoiceUrl),
        stallDelayMs: FALLBACK_DELAY_MS,
        onMessage: (message) => this.#handleMessage(message),
        onStall: () => {
          this.#fallback.hidden = false
        },
      }),
    }

    this.#dialog.showModal()
  }

  close(): void {
    this.#close("api")
  }

  disconnectedCallback(): void {
    this.#teardown()
  }

  #handleMessage(message: EmbedFrameMessage): void {
    switch (message.type) {
      case "ready":
        this.#show()
        this.#emit("bitcart:ready", message.payload)
        break

      case "status":
        this.#emit("bitcart:status", message.payload)
        break

      case "expired":
        this.#emit("bitcart:expired", message.payload)
        break

      case "complete": {
        const { redirect_url } = message.payload

        const isDefaultAllowed = this.#emit("bitcart:complete", message.payload, {
          cancelable: true,
        })

        if (isDefaultAllowed && isHttpHref(redirect_url)) navigateTo(redirect_url)

        break
      }

      case "close":
        this.#close("checkout")
        break

      case "error":
        this.#show()
        this.#emit("bitcart:error", message.payload)
        break
    }
  }

  #show(): void {
    if (this.#current && this.#dialog.dataset.state !== "shown") {
      this.#dialog.dataset.state = "shown"
      this.#current.frame.focus()
    }
  }

  #close(reason: CheckoutCloseReason): void {
    if (this.#current) {
      this.#teardown()
      this.#emit("bitcart:close", { reason })
    }
  }

  #teardown(): void {
    if (this.#current) {
      const { session, frame, restorePageScroll } = this.#current

      this.#current = null
      session.stop()
      frame.remove()
      this.#dialog.close()
      restorePageScroll()
    }
  }

  #emit<Type extends keyof CheckoutEventMap>(
    type: Type,
    detail: CheckoutEventMap[Type]["detail"],
    { cancelable = false } = {},
  ): boolean {
    return this.dispatchEvent(new CustomEvent(type, { detail, cancelable }))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [CHECKOUT_ELEMENT_TAG]: BitcartCheckoutElement
  }
}
