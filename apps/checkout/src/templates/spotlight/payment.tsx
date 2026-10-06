import { useLingui } from "@lingui/react/macro"
import { CopyIcon, SearchIcon, WalletIcon } from "lucide-react"
import { useState, type ReactNode } from "react"

import {
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_PAYMENT_URI_TESTID,
  ExtensionSlot,
  CopyField,
  PartialPaymentNotice,
  PaymentQr,
  RecommendedFee,
  StoreLogo,
  useCheckout,
  WalletButton,
  useCheckoutCopy,
} from "#/checkout"

import { Palette } from "./palette"

type Command = {
  id: string
  label: string
  description: string
  icon: ReactNode
  run: () => void
}

export const SpotlightPayment = () => {
  const { t } = useLingui()
  const { invoice, payment, store, changeMethod } = useCheckout("payment")
  const copy = useCheckoutCopy()
  const [query, setQuery] = useState("")
  const { paymentUrl } = payment

  const commands: Command[] = [
    {
      id: "copy-address",
      label: t`Copy Address`,
      description: payment.address,
      icon: <CopyIcon className="size-4" />,
      run: () => copy(payment.address, t`Address`),
    },

    ...(paymentUrl
      ? [
          {
            id: "copy-uri",
            label: t`Copy Payment URI`,
            description: paymentUrl,
            icon: <CopyIcon className="size-4" />,
            run: () => copy(paymentUrl, t`Payment URI`),
          },

          {
            id: "open-wallet",
            label: t`Open in Wallet`,
            description: t`Launch wallet application`,
            icon: <WalletIcon className="size-4" />,
            run: () => window.location.assign(paymentUrl),
          },
        ]
      : []),

    ...(changeMethod
      ? [
          {
            id: "switch",
            label: t`Switch Currency`,
            description: t`Choose a different payment method`,
            icon: <SearchIcon className="size-4" />,
            run: changeMethod,
          },
        ]
      : []),
  ]

  const normalizedQuery = query.trim().toLowerCase()

  const matchingCommands = normalizedQuery
    ? commands.filter(({ label }) =>
        normalizedQuery.split(/\s+/u).every((word) => label.toLowerCase().includes(word)),
      )
    : []

  return (
    <Palette
      query={query}
      onQueryChange={setQuery}
      onEscape={changeMethod}
      placeholder={t`Type a command...`}
      listLabel={t`Actions`}
      options={matchingCommands.map((command) => ({
        value: command.id,
        label: command.label,

        //* The palette keeps its query after a pick, which would leave the command list open.
        onSelect: () => {
          setQuery("")
          command.run()
        },

        content: (
          <>
            <span className="text-muted-foreground">{command.icon}</span>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{command.label}</div>
              <div className="text-muted-foreground truncate text-[11px]">
                {command.description}
              </div>
            </div>
          </>
        ),
      }))}
    >
      <div className="bg-muted/40 px-5 py-4 flex items-center justify-between">
        <div>
          <StoreLogo className="mb-2 h-6" />

          <div className="text-muted-foreground font-medium tracking-wider text-[10px] uppercase">
            {store.name}
          </div>

          <div
            className="mt-1 text-2xl font-bold tracking-tight"
            data-testid={CHECKOUT_AMOUNT_TESTID}
          >
            {payment.amount}
            <span className="ml-1.5 text-muted-foreground text-sm font-medium">{payment.name}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-mono text-right">
          <div>
            {invoice.price} {invoice.currency}
          </div>

          <div className="mt-0.5">{payment.rateStr}</div>
          <RecommendedFee className="mt-0.5" />
        </div>
      </div>

      <PartialPaymentNotice className="mx-5 mt-5" />

      <div className="gap-5 p-5 sm:flex-row sm:items-start flex flex-col items-center">
        <PaymentQr size={160} className="p-3 rounded-xl shrink-0" />

        <div className="min-w-0 space-y-3 w-full flex-1">
          <CopyField
            label={t`Address`}
            value={payment.address}
            testId={CHECKOUT_PAYMENT_ADDRESS_TESTID}
          />

          {paymentUrl && (
            <CopyField
              label={t`Payment URI`}
              value={paymentUrl}
              testId={CHECKOUT_PAYMENT_URI_TESTID}
            />
          )}

          <WalletButton className="rounded-lg w-full" />
        </div>
      </div>

      <ExtensionSlot name="checkout:payment-extra" className="px-5 pb-4" />

      {changeMethod && (
        <p className="px-5 pb-3 text-muted-foreground text-[10px]">
          {t`Press Esc or type "switch" to pay with another currency`}
        </p>
      )}
    </Palette>
  )
}
