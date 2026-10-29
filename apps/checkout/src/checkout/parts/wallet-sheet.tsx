import { useCopyStatus } from "@bitcart/hooks"
import {
  Badge,
  Button,
  ResponsiveDialog,
  ResponsiveDialogHeader,
  ResponsiveDialogPanel,
  ResponsiveDialogPopup,
  ResponsiveDialogTitle,
  ToggleGroup,
  ToggleGroupItem,
  WalletLogo,
} from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react/macro"
import { ArrowLeftIcon, ExternalLinkIcon, InfoIcon } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useState, type ReactNode } from "react"

import { useAmountFormat } from "../amount-format"
import { useCheckout } from "../hooks"
import type { CheckoutMethod, CheckoutWalletLink } from "../model"
import { getNetworkName, parseWalletNetwork } from "../networks"
import { getWalletMethod } from "../wallet-pay/button-kind"
import type { WalletChoice, WalletPayAttempt } from "../wallet-pay/control-store"
import {
  useInjectedWallets,
  useIsTouchDevice,
  useWalletPay,
  useWalletPayState,
  useWalletPayTarget,
} from "../wallet-pay/kit"
import type { InjectedWallet } from "../wallet-pay/types"
import { CopyStatusIcon } from "./copy-feedback"
import { MarkedValue } from "./copyable-value"

const QR_SIZE = 200
const QR_LOGO_SIZE = 40

const QR_LOGO_HOLE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"/>')}`

type SheetMethod = CheckoutMethod & { paymentUrl: string | null }

const useSheetMethod = (): SheetMethod | null => {
  const model = useCheckout()
  const method = getWalletMethod(model)

  return (
    method && { ...method, paymentUrl: model.phase === "payment" ? model.payment.paymentUrl : null }
  )
}

const useWalletName = () => {
  const { t } = useLingui()

  return {
    inSentence: ({ name }: Pick<WalletChoice, "name">) => name ?? t`your wallet`,
    asTitle: ({ name }: Pick<WalletChoice, "name">) => name ?? t`Browser wallet`,
  }
}

const WalletRow = ({
  logo,
  title,
  caption,
  badge,
  onClick,
  href,
}: {
  logo: ReactNode
  title: string
  caption?: string
  badge?: ReactNode
  onClick?: () => void
  href?: string
}) => (
  <Button
    variant="outline"
    className="gap-3 rounded-xl p-3 text-foreground h-auto w-full justify-start text-left whitespace-normal"
    onClick={onClick}
    {...(href
      ? { role: "link", nativeButton: false, render: <a href={href} aria-label={title} /> }
      : {})}
  >
    {logo}

    <span className="min-w-0 flex-1">
      <span className="text-sm font-medium block">{title}</span>

      {caption && (
        <span className="text-xs text-muted-foreground font-normal block">{caption}</span>
      )}
    </span>

    {badge}
  </Button>
)

const BlockedWalletsNote = () => {
  const { t } = useLingui()
  const { invoice } = useCheckout()

  return (
    <div className="gap-3 rounded-xl bg-muted/50 p-3 text-sm flex items-start">
      <InfoIcon aria-hidden className="mt-0.5 size-4 text-muted-foreground shrink-0" />

      <div className="gap-2 flex flex-col items-start">
        <p>
          <span className="font-medium">{t`Don't see your browser wallet?`}</span>{" "}
          <span className="text-muted-foreground">
            {t`The store's page blocks wallets from reaching this checkout.`}
          </span>
        </p>

        <Button
          size="sm"
          variant="outline"
          role="link"
          nativeButton={false}
          render={
            <a
              href={`/i/${invoice.id}`}
              target="_blank"
              rel="noopener"
              aria-label={t`Open in a new tab`}
            />
          }
        >
          {t`Open in a new tab`}
          <ExternalLinkIcon aria-hidden className="ml-1 size-3" />
        </Button>
      </div>
    </div>
  )
}

const WalletLinkQr = ({
  links,
  selectedId,
  onSelect,
  onBack,
}: {
  links: CheckoutWalletLink[]
  selectedId: string
  onSelect: (id: string) => void
  onBack: () => void
}) => {
  const { t } = useLingui()
  const { status, copy } = useCopyStatus<"link">()
  const link = links.find(({ id }) => id === selectedId) ?? links[0]
  const appName = link?.name

  if (!link) {
    return null
  } else
    return (
      <div className="gap-4 flex flex-col items-center">
        <Button variant="ghost" size="sm" className="self-start" onClick={onBack}>
          <ArrowLeftIcon aria-hidden className="mr-1 size-4" />
          {t`All wallets`}
        </Button>

        <div
          role="img"
          aria-label={t`QR code that opens this invoice in ${appName}`}

          className="rounded-xl border-border bg-white p-3 relative border"
        >
          <QRCodeSVG
            value={link.href}
            size={QR_SIZE}
            level="H"
            aria-hidden
            imageSettings={{
              src: QR_LOGO_HOLE,
              width: QR_LOGO_SIZE,
              height: QR_LOGO_SIZE,
              excavate: true,
            }}
          />

          <WalletLogo
            id={link.id}
            size={QR_LOGO_SIZE - 4}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        {links.length > 1 && (
          <ToggleGroup
            value={[link.id]}
            onValueChange={([id]) => id && onSelect(id)}
            aria-label={t`Wallet app`}
            className="gap-2 flex flex-wrap justify-center"
          >
            {links.map(({ id, name }) => (
              <ToggleGroupItem
                key={id}
                value={id}
                variant="outline"
                size="sm"
                className="gap-2 pl-1 pr-3 rounded-full"
              >
                <WalletLogo id={id} size={20} className="rounded-full" />
                {name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        <p className="text-sm text-muted-foreground text-center text-balance">
          {t`Scan with your phone's camera to open this invoice in ${appName}.`}
        </p>

        <Button variant="outline" size="sm" onClick={() => copy("link", link.href)}>
          <CopyStatusIcon outcome={status?.outcome ?? null} className="mr-1 size-3" />
          {status?.outcome === "copied" ? t`Link copied` : t`Copy link`}
        </Button>
      </div>
    )
}

const InjectedWalletButton = ({
  wallet,
  onPay,
}: {
  wallet: InjectedWallet
  onPay: (wallet: InjectedWallet) => void
}) => {
  const { t } = useLingui()
  const walletName = useWalletName().asTitle(wallet)

  return (
    <Button size="lg" className="rounded-xl" onClick={() => onPay(wallet)}>
      <WalletLogo src={wallet.icon} id={wallet.logoId} size={20} className="mr-2" />
      {t`Pay with ${walletName}`}
    </Button>
  )
}

const WalletAppButton = ({ link: { id, name, href } }: { link: CheckoutWalletLink }) => {
  const { t } = useLingui()

  return (
    <Button
      size="lg"
      variant="outline"
      className="rounded-xl"
      role="link"
      nativeButton={false}
      render={<a href={href} aria-label={t`Open in ${name}`} />}
    >
      <WalletLogo id={id} size={20} className="mr-2" />
      {t`Open in ${name}`}
    </Button>
  )
}

const isFramed = () => typeof window !== "undefined" && window.self !== window.top

const WalletChooser = ({ method }: { method: SheetMethod }) => {
  const { t } = useLingui()
  const { runner } = useWalletPay()
  const target = useWalletPayTarget()
  const injected = useInjectedWallets(target?.network ?? null)
  const isTouchDevice = useIsTouchDevice()
  const names = useWalletName()
  const [qrLinkId, setQrLinkId] = useState<string | null>(null)
  const links = method.walletLinks
  const wallets = target ? injected : []
  const isWalletBlocked = isFramed() && injected.length === 0
  const pay = (wallet: InjectedWallet) => target && runner.start(wallet, target)

  if (qrLinkId !== null && !isTouchDevice) {
    return (
      <WalletLinkQr
        links={links}
        selectedId={qrLinkId}
        onSelect={setQrLinkId}
        onBack={() => setQrLinkId(null)}
      />
    )
  } else if (isTouchDevice) {
    return (
      <div className="gap-2 flex flex-col">
        {wallets.map((wallet) => (
          <InjectedWalletButton key={wallet.id} wallet={wallet} onPay={pay} />
        ))}

        {links.map((link) => (
          <WalletAppButton key={link.id} link={link} />
        ))}

        {method.paymentUrl && (
          <Button
            size="lg"
            variant="ghost"
            className="rounded-xl"
            role="link"
            nativeButton={false}
            render={<a href={method.paymentUrl} aria-label={t`Other wallet`} />}
          >
            {t`Other wallet`}
          </Button>
        )}

        {isWalletBlocked && <BlockedWalletsNote />}
      </div>
    )
  } else
    return (
      <div className="gap-2 flex flex-col">
        {wallets.map((wallet) => (
          <WalletRow
            key={wallet.id}
            logo={<WalletLogo src={wallet.icon} id={wallet.logoId} size={36} />}
            title={names.asTitle(wallet)}
            badge={<Badge variant="accent">{t`Installed`}</Badge>}
            onClick={() => pay(wallet)}
          />
        ))}

        {links.map((link) => (
          <WalletRow
            key={link.id}
            logo={<WalletLogo id={link.id} size={36} />}
            title={link.name}
            badge={<Badge variant="secondary">{t`Scan with phone`}</Badge>}
            onClick={() => setQrLinkId(link.id)}
          />
        ))}

        {method.paymentUrl && (
          <WalletRow
            logo={<WalletLogo size={36} />}
            title={t`Other wallet`}
            caption={t`Opens the wallet app set up on this computer`}
            href={method.paymentUrl}
          />
        )}

        {isWalletBlocked && <BlockedWalletsNote />}
      </div>
    )
}

const AttemptLayout = ({
  wallet,
  isWaiting,
  title,
  children,
  actions,
}: {
  wallet: WalletChoice
  isWaiting: boolean
  title: string
  children: ReactNode
  actions: ReactNode
}) => (
  <div className="gap-3 py-2 flex flex-col items-center text-center" aria-live="polite">
    <div className="size-18 relative flex items-center justify-center">
      {isWaiting && (
        <span
          aria-hidden
          className="inset-0 border-primary animate-spin absolute rounded-full border-2 border-t-transparent motion-reduce:animate-none"
        />
      )}

      <WalletLogo src={wallet.icon} id={wallet.logoId} size={48} />
    </div>

    <h3 className="font-medium">{title}</h3>
    <div className="text-sm text-muted-foreground gap-2 flex flex-col items-center">{children}</div>
    <div className="gap-2 mt-2 grid w-full">{actions}</div>
  </div>
)

const AttemptView = ({
  attempt,
  method,
}: {
  attempt: WalletPayAttempt
  method: CheckoutMethod
}) => {
  const { t } = useLingui()
  const { runner, control } = useWalletPay()
  const target = useWalletPayTarget()
  const names = useWalletName()
  const { wallet, step } = attempt
  const name = names.inSentence(wallet)
  const walletTitle = names.asTitle(wallet)
  const format = useAmountFormat()
  const amount = format.crypto(method.amount, method.symbol)
  const network = parseWalletNetwork(method.network)
  const chainId = network?.chainId
  const networkName = (network && getNetworkName(network)) ?? t`chain ${chainId}`
  const injected = useInjectedWallets(network).find(({ id }) => id === wallet.id)

  const retry = (options?: { reselectAccount: boolean }) =>
    injected && target && runner.start(injected, target, options)

  const back = (
    <Button
      size="lg"
      variant="ghost"
      className="rounded-xl"
      onClick={control.actions.dismissAttempt}
    >
      {t`Other ways to pay`}
    </Button>
  )

  const retryButton = (
    <Button
      size="lg"
      className="rounded-xl"
      disabled={!injected || !target}
      onClick={() => retry()}
    >
      {t`Try again`}
    </Button>
  )

  const outcome = (title: string, text: ReactNode, primary: ReactNode = retryButton) => (
    <AttemptLayout
      wallet={wallet}
      isWaiting={false}
      title={title}
      actions={
        <>
          {primary}
          {back}
        </>
      }
    >
      {text}
    </AttemptLayout>
  )

  const waiting = (title: string, text: string) => (
    <AttemptLayout
      wallet={wallet}
      isWaiting
      title={title}
      actions={
        <Button
          size="lg"
          variant="ghost"
          className="rounded-xl"
          onClick={control.actions.dismissAttempt}
        >
          {t`Cancel`}
        </Button>
      }
    >
      <p>{text}</p>
    </AttemptLayout>
  )

  switch (step.kind) {
    case "connecting":
      return waiting(t`Confirm in ${name}`, t`Approve the connection in ${name}.`)

    case "checking":
    case "awaitingPayment":
      return waiting(t`Checking your wallet…`, t`Making sure ${name} can pay ${amount}.`)

    case "savingAddress":
      return waiting(
        t`Saving your address…`,
        t`Payments from this address will count toward this invoice.`,
      )

    case "confirming":
      return waiting(t`Confirm in ${name}`, t`Approve the payment of ${amount} in ${name}.`)

    case "mismatch":
      return outcome(
        t`Switch to your saved address`,

        <>
          <p>{t`Payments must come from the address you entered. Switch to it in ${name}, then try again.`}</p>

          <p className="text-xs font-mono break-all">
            <span className="font-sans block">{t`Connected`}</span>
            <MarkedValue value={step.account} isMarked />
          </p>

          <p className="text-xs font-mono break-all">
            <span className="font-sans block">{t`Payments must come from`}</span>
            <MarkedValue value={step.expected} isMarked />
          </p>
        </>,

        injected?.family === "eip155" ? (
          <Button
            size="lg"
            className="rounded-xl"
            disabled={!target}
            onClick={() => retry({ reselectAccount: true })}
          >
            {t`Choose account`}
          </Button>
        ) : undefined,
      )

    case "addressRejected":
      return outcome(
        t`This address can't be used`,
        <p>{t`The store didn't accept the address ${name} is connected to.`}</p>,
        null,
      )

    case "failed": {
      const { failure } = step

      switch (failure.kind) {
        case "rejected":
          return outcome(t`Request cancelled`, <p>{t`You cancelled the request in ${name}.`}</p>)

        case "pending":
          return outcome(
            t`${walletTitle} is waiting for you`,
            <p>{t`It already has a request open. Finish or dismiss it in ${name}, then try again.`}</p>,
          )

        case "locked":
          return outcome(t`Unlock ${name}`, <p>{t`Unlock your wallet, then try again.`}</p>)

        case "wrongNetwork":
          return outcome(
            t`Wrong network`,
            <p>{t`Switch ${name} to ${networkName}, then try again.`}</p>,
          )

        case "insufficientAmount": {
          const symbol = method.symbol.toUpperCase()
          const balance = format.crypto(failure.balance, method.symbol)

          return outcome(
            t`Not enough ${symbol}`,
            <p>{t`This wallet has ${balance}. The invoice needs ${amount}.`}</p>,
          )
        }

        case "insufficientFee": {
          const { feeSymbol } = failure
          const fee = format.crypto(failure.fee, feeSymbol)

          return outcome(
            t`Not enough ${feeSymbol} for the network fee`,
            <p>{t`The network fee is about ${fee}.`}</p>,
          )
        }

        case "error":
          return outcome(
            t`Couldn't send the payment`,

            <>
              <p>{t`${walletTitle} returned an error.`}</p>
              {failure.message && <p className="text-xs break-words">{failure.message}</p>}
            </>,
          )
      }
    }
  }
}

export const WalletSheet = () => {
  const { t } = useLingui()
  const { control } = useWalletPay()
  const isOpen = useWalletPayState(({ isSheetOpen }) => isSheetOpen)
  const attempt = useWalletPayState((state) => state.attempt)
  const method = useSheetMethod()

  return (
    <ResponsiveDialog
      open={isOpen && method !== null}
      onOpenChange={(open) => {
        if (!open) control.actions.closeSheet()
      }}
    >
      <ResponsiveDialogPopup>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{t`Pay with a wallet`}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogPanel>
          <div className="pb-4">
            {method &&
              (attempt ? (
                <AttemptView attempt={attempt} method={method} />
              ) : (
                <WalletChooser method={method} />
              ))}
          </div>
        </ResponsiveDialogPanel>
      </ResponsiveDialogPopup>
    </ResponsiveDialog>
  )
}
