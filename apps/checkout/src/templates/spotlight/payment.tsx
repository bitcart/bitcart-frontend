import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { CopyIcon, SearchIcon, WalletIcon } from "lucide-react"
import { useState, type ReactNode } from "react"

import {
  AmountBreakdown,
  ExtensionSlot,
  LightningNodeInfo,
  ManualPaymentDivider,
  MethodHint,
  PartialPaymentProgress,
  PayingWith,
  PaymentAddress,
  PaymentAmountHeading,
  PaymentDeadline,
  PaymentQr,
  RecommendedFee,
  SenderAddress,
  WalletButton,
  useCheckout,
  useCheckoutCopyStatus,
  useWalletAction,
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
  const { invoice, payment, changeMethod, environment } = useCheckout("payment")
  const copy = useCheckoutCopyStatus()
  const [query, setQuery] = useState("")
  const unit = payment.symbol.toUpperCase()
  const openWallet = useWalletAction()

  //* Copy commands confirm on the copied value itself, which shares `copy` with them.
  const payCommands: Command[] = [
    {
      id: "copy-address",
      label: payment.lightning ? t`Copy Lightning Invoice` : t`Copy Address`,
      description: payment.address,
      icon: <CopyIcon className="size-4" />,
      run: () => copy.copy("address", payment.address),
    },

    ...(!payment.lightning && !invoice.isAnyAmount
      ? [
          {
            id: "copy-amount",
            label: t`Copy Amount`,
            description: `${payment.amount} ${unit}`,
            icon: <CopyIcon className="size-4" />,
            run: () => copy.copy("amount", payment.amount),
          },
        ]
      : []),

    ...(openWallet
      ? [
          {
            id: "open-wallet",
            label: t`Pay with wallet`,
            description: t`Launch wallet application`,
            icon: <WalletIcon className="size-4" />,
            run: openWallet,
          },
        ]
      : []),
  ]

  const commands: Command[] = [
    ...(environment.terminal ? [] : payCommands),

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
      searchLabel={t`Type a command...`}
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
      <PayingWith copy={copy} className="border-border border-b" />
      <PartialPaymentProgress showAmountDue={false} className="mx-5 mt-4" />
      <AmountBreakdown className="mx-5 mt-4" />

      <div className="px-5 pt-4">
        <PaymentAmountHeading copy={copy} showsPrice namesStore />
        <PaymentDeadline className="mt-1 text-xs" />
        <SenderAddress className="mt-4" />
      </div>

      <div
        className={cn(
          "gap-5 p-5 flex flex-col items-center",

          //! A terminal's QR fills the card, so it stacks above the details at every width.
          !environment.terminal && "sm:flex-row sm:items-stretch",
        )}
      >
        {!environment.terminal && (
          <div className="sm:hidden w-full">
            <WalletButton className="rounded-lg w-full" />
            <ManualPaymentDivider className="mt-4" />
          </div>
        )}

        <PaymentQr
          className={cn(
            "p-3 rounded-xl shrink-0",
            !environment.terminal && "max-sm:hidden sm:self-start",
          )}
        />

        {/* On desktop the column is as tall as the QR: its three blocks spread evenly, and Pay with wallet ends at the QR's bottom. */}
        <div className="min-w-0 sm:flex sm:flex-col sm:justify-between w-full flex-1">
          <div>
            {!environment.terminal && (
              <span className="mb-1 text-muted-foreground font-medium tracking-wider max-sm:hidden block text-[11px] uppercase">
                {payment.lightning ? t`Lightning invoice` : t`Address`}
              </span>
            )}

            <PaymentAddress copy={copy} isStartAlignedFromSm={!environment.terminal} />

            <RecommendedFee
              className={cn(
                "mt-1 text-xs text-muted-foreground text-center",
                !environment.terminal && "sm:text-left",
              )}
            />

            <LightningNodeInfo
              copy={copy}
              isStartAlignedFromSm={!environment.terminal}
              className="mt-2"
            />
          </div>

          <div className="mt-3">
            <MethodHint />
          </div>

          <div className="pt-3 max-sm:hidden">
            <WalletButton className="rounded-lg w-full" />
          </div>
        </div>
      </div>

      <ExtensionSlot name="checkout:payment-extra" className="px-5 pb-4" />

      {changeMethod && !environment.terminal && (
        <p className="px-5 pb-3 text-muted-foreground text-[10px]">
          {t`Press Esc or type "switch" to pay with another currency`}
        </p>
      )}
    </Palette>
  )
}
