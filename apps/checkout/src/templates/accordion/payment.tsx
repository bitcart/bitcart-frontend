import { Button } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  CoinsIcon,
  QrCodeIcon,
  WalletIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_COUNTDOWN_TESTID,
  CHECKOUT_METHOD_SELECTOR_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_PAYMENT_URI_TESTID,
  CheckoutConnectionBanner,
  CheckoutFooter,
  ExtensionSlot,
  CopyField,
  PartialPaymentNotice,
  PaymentQr,
  RecommendedFee,
  StoreLogo,
  WalletButton,
  useCheckout,
  useCheckoutCountdown,
} from "#/checkout"

type SectionId = "currency" | "amount" | "qr" | "wallet"

const SECTION_ORDER: SectionId[] = ["currency", "amount", "qr", "wallet"]

const getDotClassName = (isComplete: boolean, isOpen: boolean) => {
  //* A finished step marks progress, not a payment outcome: it uses the palette's `accent`.
  if (isComplete) {
    return "bg-accent text-accent-foreground"
  } else if (isOpen) {
    return "bg-primary text-primary-foreground"
  } else return "bg-muted text-muted-foreground"
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
          ${isComplete ? "text-accent-foreground" : ""}
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
      inert={!isOpen}
    >
      <div ref={ref} className="px-5 pb-5 pt-1">
        {children}
      </div>
    </div>
  )
}

export const AccordionPayment = () => {
  const { t } = useLingui()
  const { invoice, methods, payment, selectMethod, store } = useCheckout("payment")
  const countdown = useCheckoutCountdown()

  const [openSection, setOpenSection] = useState<SectionId>(
    methods.length > 1 ? "currency" : "amount",
  )

  const [completedSections, setCompletedSections] = useState<Set<SectionId>>(
    () => new Set(methods.length <= 1 ? ["currency" as SectionId] : []),
  )

  const advanceTo = useCallback(
    (section: SectionId) => {
      const currentIndex = SECTION_ORDER.indexOf(openSection)
      const nextIndex = SECTION_ORDER.indexOf(section)

      //* Marks the open section and every section before it as complete.
      setCompletedSections(
        (prev) => new Set([...prev, ...SECTION_ORDER.slice(0, currentIndex + 1)]),
      )

      if (nextIndex > currentIndex) {
        setOpenSection(section)
      }
    },
    [openSection],
  )

  return (
    <div
      className={cn(`
        max-w-md rounded-2xl bg-card text-card-foreground shadow-2xl w-full overflow-hidden
      `)}
    >
      {/* Compact header with store name + countdown */}
      <div className="gap-3 px-5 py-4 border-border flex items-center justify-between border-b">
        <StoreLogo />

        <div className="min-w-0 flex-1">
          <div className="text-base font-bold tracking-tight truncate">{store.name}</div>

          <div className="mt-0.5 text-muted-foreground text-[11px]">
            {invoice.price} {invoice.currency}
          </div>
        </div>

        <div
          data-testid={CHECKOUT_COUNTDOWN_TESTID}
          className={cn(`
            gap-1.5 bg-muted px-3 py-1.5 text-muted-foreground font-medium flex shrink-0
            items-center rounded-full text-[11px] tabular-nums
          `)}
        >
          <ClockIcon className="size-3" />
          {countdown.formatted}
        </div>
      </div>

      <ExtensionSlot name="checkout:header-extra" className="px-5 py-3 border-border border-b" />
      <CheckoutConnectionBanner />

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
            <div className="gap-2 grid grid-cols-2" data-testid={CHECKOUT_METHOD_SELECTOR_TESTID}>
              {methods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    selectMethod(method.id)
                  }}
                  className={cn(`
                    gap-2 rounded-xl px-4 py-3 text-sm flex cursor-pointer items-center border
                    text-left transition-all
                    ${
                      method.id === payment.id
                        ? "border-primary bg-primary text-primary-foreground font-semibold"
                        : "border-border bg-card hover:bg-muted"
                    }
                  `)}
                >
                  <span className="truncate">{method.name}</span>
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
                  <div
                    className="text-2xl font-bold tracking-tight"
                    data-testid={CHECKOUT_AMOUNT_TESTID}
                  >
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
                <span className="font-mono">{payment.rateStr}</span>
              </div>

              <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                <span>{t`Order total`}</span>

                <span className="font-mono">
                  {invoice.price} {invoice.currency}
                </span>
              </div>

              <RecommendedFee className="mt-1 text-xs text-muted-foreground" />
            </div>

            <PartialPaymentNotice className="mt-3" />

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
              <PaymentQr />
            </div>

            <div className="mt-4 space-y-3">
              <CopyField
                label={t`Address`}
                value={payment.address}
                testId={CHECKOUT_PAYMENT_ADDRESS_TESTID}
              />

              {payment.paymentUrl && (
                <CopyField
                  label={t`Payment URI`}
                  value={payment.paymentUrl}
                  testId={CHECKOUT_PAYMENT_URI_TESTID}
                />
              )}
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
              {payment.paymentUrl
                ? t`Click below to open your wallet app and complete the payment automatically.`
                : t`Open your wallet app and send the remaining amount to the address above.`}
            </p>

            <WalletButton className="rounded-xl w-full" />
          </SectionBody>
        </div>
      </div>

      <ExtensionSlot name="checkout:payment-extra" className="px-5 py-4 border-border border-t" />
      <CheckoutFooter />
    </div>
  )
}
