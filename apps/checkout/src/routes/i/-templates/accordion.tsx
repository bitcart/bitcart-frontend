import { Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { t } from "@lingui/core/macro"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  CoinsIcon,
  CopyIcon,
  QrCodeIcon,
  WalletIcon,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useCallback, useEffect, useRef, useState } from "react"

import { CheckoutControls } from "../-components/checkout-controls"
import { StatusOverlay } from "../-components/status-overlay"
import type { CheckoutTemplateProps } from "./types"

/**
 * Accordion Template — Progressive Disclosure Checkout
 *
 * UX concept: Each checkout concern lives in its own collapsible section.
 * Sections open sequentially as the user progresses: select currency → review amount → scan/copy → open wallet.
 * Completed sections collapse with a green checkmark, giving the user a clear sense of progress
 * while keeping all information accessible with a single click to re-expand.
 */

type SectionId = "currency" | "amount" | "qr" | "wallet"

const SECTION_ORDER: SectionId[] = ["currency", "amount", "qr", "wallet"]

const CopyField = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    })
  }, [value])

  return (
    <div>
      <div className="mb-1 text-muted-foreground font-medium tracking-wider text-[11px] uppercase">
        {label}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={cn(`
          gap-2 rounded-lg border-border bg-muted/50 px-3 py-2.5 text-xs font-mono
          hover:bg-muted
          flex w-full cursor-pointer items-center border text-left transition-all
        `)}
      >
        <span className="min-w-0 flex-1 truncate">
          {/* Success green is pinned across themes, matching the rest of the checkout components.*/}
          {copied ? (
            <span className="text-green-600 dark:text-green-400 font-semibold">{t`Copied!`}</span>
          ) : (
            value
          )}
        </span>

        <CopyIcon className="size-3.5 text-muted-foreground shrink-0" />
      </button>
    </div>
  )
}

const getDotClassName = (isComplete: boolean, isOpen: boolean) => {
  //* Success green is pinned across themes, matching the rest of the checkout components.
  if (isComplete) return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
  if (isOpen) return "bg-primary text-primary-foreground"

  return "bg-muted text-muted-foreground"
}

const SectionHeader = ({
  icon,
  title,
  subtitle,
  isOpen,
  isComplete,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  isOpen: boolean
  isComplete: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(`
      gap-3 px-5 py-4 flex w-full cursor-pointer items-center text-left transition-all
      ${isOpen ? "bg-muted/40" : "hover:bg-muted/20"}
    `)}
  >
    <div
      className={cn(`
        size-9 rounded-xl flex items-center justify-center transition-all
        ${getDotClassName(isComplete, isOpen)}
      `)}
    >
      {isComplete ? <CheckCircle2Icon className="size-4.5" /> : icon}
    </div>

    <div className="min-w-0 flex-1">
      <div
        className={cn(`
          text-sm font-semibold
          ${isComplete ? "text-green-700 dark:text-green-400" : ""}
        `)}
      >
        {title}
      </div>

      {subtitle && (
        <div className="mt-0.5 text-muted-foreground truncate text-[11px]">{subtitle}</div>
      )}
    </div>

    <ChevronDownIcon
      className={cn(`
        size-4 text-muted-foreground transition-transform duration-300
        ${isOpen ? "rotate-180" : ""}
      `)}
    />
  </button>
)

const SectionBody = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.scrollHeight)
    }
  }, [isOpen, children])

  return (
    <div
      className="ease-out overflow-hidden transition-all duration-400"
      style={{ maxHeight: isOpen ? `${height + 20}px` : "0px", opacity: isOpen ? 1 : 0 }}
    >
      <div ref={ref} className="px-5 pb-5 pt-1">
        {children}
      </div>
    </div>
  )
}

export const AccordionTemplate = ({
  invoice,
  store,
  currentStatus,
  selectedPaymentIndex,
  setSelectedPaymentIndex,
  countdownFormatted,
}: CheckoutTemplateProps) => {
  const payment = invoice.payments[selectedPaymentIndex]

  const [openSection, setOpenSection] = useState<SectionId>(
    invoice.payments.length > 1 ? "currency" : "amount",
  )

  const [completedSections, setCompletedSections] = useState<Set<SectionId>>(
    () => new Set(invoice.payments.length <= 1 ? ["currency" as SectionId] : []),
  )

  const isTerminal =
    currentStatus === "complete" || currentStatus === "expired" || currentStatus === "invalid"

  const advanceTo = useCallback(
    (section: SectionId) => {
      const currentIndex = SECTION_ORDER.indexOf(openSection)
      const nextIndex = SECTION_ORDER.indexOf(section)

      //* Everything up to the section being left behind counts as done.
      setCompletedSections(
        (prev) => new Set([...prev, ...SECTION_ORDER.slice(0, currentIndex + 1)]),
      )

      if (nextIndex > currentIndex) {
        setOpenSection(section)
      }
    },
    [openSection],
  )

  if (!payment) {
    return null
  } else if (isTerminal) {
    return (
      <div className="max-w-md rounded-2xl shadow-xl w-full overflow-hidden">
        <StatusOverlay
          status={currentStatus}
          storeName={store.name}
          invoiceId={invoice.id}
          orderAmount={invoice.price}
          orderCurrency={invoice.currency}
          redirectUrl={invoice.redirect_url}
        />
      </div>
    )
  } else
    return (
      <div
        className={cn(`
          max-w-md rounded-2xl bg-card text-card-foreground shadow-2xl w-full overflow-hidden
        `)}
      >
        {/* Compact header with store name + countdown */}
        <div className="gap-3 px-5 py-4 border-border flex items-center justify-between border-b">
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold tracking-tight truncate">{store.name}</div>

            <div className="mt-0.5 text-muted-foreground text-[11px]">
              {invoice.price} {invoice.currency}
            </div>
          </div>

          <div
            className={cn(`
              gap-1.5 bg-muted px-3 py-1.5 text-muted-foreground font-medium flex shrink-0
              items-center rounded-full text-[11px] tabular-nums
            `)}
          >
            <ClockIcon className="size-3" />
            {countdownFormatted}
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-muted h-1">
          <div
            className="from-primary to-primary/60 h-full bg-linear-to-r transition-all duration-500"
            style={{
              width: `${((completedSections.size + (openSection ? 0.5 : 0)) / SECTION_ORDER.length) * 100}%`,
            }}
          />
        </div>

        {/* Accordion sections */}
        <div className="divide-border divide-y">
          {/* Section 1: Currency Selection */}
          <div>
            <SectionHeader
              icon={<CoinsIcon className="size-4" />}
              title={t`Payment Method`}
              subtitle={
                completedSections.has("currency") ? payment.name : t`Choose your cryptocurrency`
              }
              isOpen={openSection === "currency"}
              isComplete={completedSections.has("currency") && openSection !== "currency"}
              onClick={() => setOpenSection("currency")}
            />

            <SectionBody isOpen={openSection === "currency"}>
              <div className="gap-2 grid grid-cols-2">
                {invoice.payments.map((paymentOption, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedPaymentIndex(index)
                    }}
                    className={cn(`
                      gap-2 rounded-xl px-4 py-3 text-sm flex cursor-pointer items-center border
                      text-left transition-all
                      ${
                        index === selectedPaymentIndex
                          ? "border-primary bg-primary text-primary-foreground font-semibold"
                          : "border-border bg-card hover:bg-muted"
                      }
                    `)}
                  >
                    <span className="truncate">{paymentOption.name}</span>
                  </button>
                ))}
              </div>

              <Button
                className="mt-4 rounded-xl w-full"
                size="lg"
                onClick={() => advanceTo("amount")}
              >
                {t`Continue`}
              </Button>
            </SectionBody>
          </div>

          {/* Section 2: Amount Review */}
          <div>
            <SectionHeader
              icon={<span className="text-sm font-bold">#</span>}
              title={t`Amount`}
              subtitle={
                completedSections.has("amount")
                  ? `${payment.amount} ${payment.name}`
                  : t`Review payment details`
              }
              isOpen={openSection === "amount"}
              isComplete={completedSections.has("amount") && openSection !== "amount"}
              onClick={() => setOpenSection("amount")}
            />

            <SectionBody isOpen={openSection === "amount"}>
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground text-sm">{t`You pay`}</span>

                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight">
                      {payment.amount}

                      <span className="ml-1.5 text-muted-foreground text-sm font-medium">
                        {payment.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 bg-border h-px" />

                <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                  <span>{t`Exchange rate`}</span>
                  <span className="font-mono">{payment.rate_str}</span>
                </div>

                <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                  <span>{t`Order total`}</span>

                  <span className="font-mono">
                    {invoice.price} {invoice.currency}
                  </span>
                </div>
              </div>

              <Button className="mt-4 rounded-xl w-full" size="lg" onClick={() => advanceTo("qr")}>
                {t`Continue`}
              </Button>
            </SectionBody>
          </div>

          {/* Section 3: QR / Copy */}
          <div>
            <SectionHeader
              icon={<QrCodeIcon className="size-4" />}
              title={t`Scan or Copy`}
              subtitle={openSection === "qr" ? t`Send payment to this address` : t`Payment details`}
              isOpen={openSection === "qr"}
              isComplete={completedSections.has("qr") && openSection !== "qr"}
              onClick={() => setOpenSection("qr")}
            />

            <SectionBody isOpen={openSection === "qr"}>
              <div className="flex justify-center">
                {/*! The QR quiet zone stays white in both themes so scanners keep their contrast. */}
                <div className="rounded-2xl border-border bg-white p-4 shadow-sm border">
                  <QRCodeSVG value={payment.payment_url} size={200} level="M" />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <CopyField label={t`Address`} value={payment.payment_address} />
                <CopyField label={t`Payment URI`} value={payment.payment_url} />
              </div>

              <Button
                className="mt-4 rounded-xl w-full"
                size="lg"
                onClick={() => advanceTo("wallet")}
              >
                {t`Continue`}
              </Button>
            </SectionBody>
          </div>

          {/* Section 4: Open Wallet */}
          <div>
            <SectionHeader
              icon={<WalletIcon className="size-4" />}
              title={t`Open Wallet`}
              subtitle={t`Launch your wallet app`}
              isOpen={openSection === "wallet"}
              isComplete={false}
              onClick={() => setOpenSection("wallet")}
            />

            <SectionBody isOpen={openSection === "wallet"}>
              <p className="mb-3 text-muted-foreground text-sm">
                {t`Click below to open your wallet app and complete the payment automatically.`}
              </p>

              {/*! `payment_url` is a BIP21-style wallet URI, so it can't go through `LinkButton`'s HTTP-only href. */}
              <Button
                className="rounded-xl w-full"
                size="lg"
                render={<a href={payment.payment_url} aria-label={t`Open in Wallet`} />}
              >
                <WalletIcon className="mr-2 size-4" />
                {t`Open in Wallet`}
              </Button>
            </SectionBody>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-border flex items-center justify-between border-t">
          <CheckoutControls />
          <span className="text-muted-foreground text-[10px]">{t`Powered by`} Bitcart</span>
        </div>
      </div>
    )
}
