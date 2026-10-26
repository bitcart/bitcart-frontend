import type {
  CheckoutPreviewAxes,
  CheckoutPreviewEnvironment,
  CheckoutPreviewExpiration,
  CheckoutPreviewView,
  CheckoutPreviewWallet,
} from "@bitcart/qa"
import { useEffect, useMemo, useState } from "react"
import { isDeepEqual } from "remeda"

import type { CheckoutModel, CheckoutSource } from "../model"
import type { CheckoutAppConfig } from "../runtime/context"
import { CheckoutReceiptView } from "../runtime/receipt-view"
import type { CheckoutTemplateRegistry } from "../runtime/registry"
import { CheckoutView } from "../runtime/view"
import { installFakeTerminal, type FakeTerminalOptions } from "../terminal"
import type { CheckoutPalette } from "../theme/palette"
import { normalizePreviewAxes } from "./axes"
import { PREVIEW_BRANDS, type CheckoutPreviewBrand } from "./brands"
import { buildPreviewScenario } from "./build"
import {
  datePreviewInvoice,
  getPreviewSpeed,
  withPreviewExpiration,
  type CheckoutPreviewSpeed,
} from "./expiration"
import {
  getPreviewActions,
  toPreviewConnectionHandle,
  type PreviewAction,
  type PreviewConnection,
} from "./simulation"
import { PreviewSimulator } from "./simulator"
import { installPreviewWallets } from "./wallets"

const PRINT_LATENCY_MS = 600

const FAKE_TERMINALS: Record<CheckoutPreviewEnvironment, FakeTerminalOptions> = {
  terminal: { latencyMs: PRINT_LATENCY_MS },
  "terminal-out-of-paper": { failWith: "PRINTER_OUT_OF_PAPER", latencyMs: PRINT_LATENCY_MS },
  "terminal-no-printer": { printer: false },
}

type CheckoutPreviewProps = {
  registry: CheckoutTemplateRegistry
  templateId: string
  axes: CheckoutPreviewAxes
  view?: CheckoutPreviewView
  environment?: CheckoutPreviewEnvironment
  wallet?: CheckoutPreviewWallet
  expiration?: CheckoutPreviewExpiration
  speed?: CheckoutPreviewSpeed
  palette?: CheckoutPalette | null
  brand?: CheckoutPreviewBrand
  appConfig?: CheckoutAppConfig
  showsSimulator?: boolean
  onModelChange?: (model: CheckoutModel, source: CheckoutSource) => void
}

const ScenarioView = ({
  registry,
  templateId,
  axes: requestedAxes,
  view = "checkout",
  expiration,
  speed,
  palette,
  brand,
  appConfig,
  showsSimulator = true,
  onModelChange,
  onReset,
}: CheckoutPreviewProps & { onReset: () => void }) => {
  const [initialAxes] = useState(() => normalizePreviewAxes(requestedAxes))
  const [axes, setAxes] = useState(initialAxes)
  const [scenario, setScenario] = useState(() => buildPreviewScenario(initialAxes))

  const [invoice, setInvoice] = useState(() =>
    datePreviewInvoice(withPreviewExpiration(scenario.invoice, expiration), Date.now()),
  )

  const [connectionState, setConnectionState] = useState<PreviewConnection>("connected")

  const connection = useMemo(
    () => toPreviewConnectionHandle(connectionState, () => setConnectionState("connected")),
    [connectionState],
  )

  const simulate = ({ next }: PreviewAction) => {
    const nextScenario = buildPreviewScenario(next)

    setAxes(next)
    setScenario(nextScenario)

    setInvoice((current) => ({
      ...nextScenario.invoice,
      time_left: nextScenario.invoice.time_left === 0 ? 0 : current.time_left,
      expiration_seconds: current.expiration_seconds,
      created: current.created,
      buyer_email: current.buyer_email,
      shipping_address: current.shipping_address,
      notes: current.notes,
      payments: nextScenario.invoice.payments.map((payment) => ({
        ...payment,
        user_address:
          current.payments.find(({ id }) => id === payment.id)?.user_address ??
          payment.user_address,
      })),
    }))
  }

  const source = useMemo<CheckoutSource>(
    () => ({
      ...scenario,
      invoice,
      appearance: {
        ...(brand ? PREVIEW_BRANDS[brand] : {}),
        ...(palette ? { palette } : {}),
      },

      submitCustomerDetails: (update) => {
        setInvoice((current) => ({ ...current, ...update }))

        return Promise.resolve()
      },

      submitSenderAddress: (methodId, address) => {
        setInvoice((current) => ({
          ...current,

          payments: current.payments.map((payment) =>
            payment.id === methodId ? { ...payment, user_address: address } : payment,
          ),
        }))

        return Promise.resolve("accepted")
      },
    }),
    [scenario, invoice, palette, brand],
  )

  const simulator = showsSimulator && (
    <PreviewSimulator
      actions={getPreviewActions(axes)}
      onAction={simulate}
      connection={connectionState}
      onConnectionChange={setConnectionState}
      isSimulated={!isDeepEqual(axes, initialAxes) || connectionState !== "connected"}
      onReset={onReset}
    />
  )

  if (view === "receipt") {
    return (
      <>
        {simulator}

        <CheckoutReceiptView
          source={source}
          appConfig={appConfig}
          unavailable={
            <p className="text-muted-foreground text-sm">This scenario has no receipt.</p>
          }
        />
      </>
    )
  } else
    return (
      <>
        {simulator}

        <CheckoutView
          source={source}
          connection={connection}
          registry={registry}
          templateId={templateId}
          appConfig={appConfig}
          countdownSpeed={getPreviewSpeed(speed)}
          onModelChange={onModelChange}
        />
      </>
    )
}

export const CheckoutPreview = (props: CheckoutPreviewProps) => {
  const { environment, wallet } = props
  const [resets, setResets] = useState(0)

  useEffect(
    () => (environment ? installFakeTerminal(FAKE_TERMINALS[environment]) : undefined),
    [environment],
  )

  useEffect(() => (wallet ? installPreviewWallets(wallet) : undefined), [wallet])

  const key = JSON.stringify([props.axes, environment, wallet, props.expiration, resets])

  return <ScenarioView key={key} {...props} onReset={() => setResets((count) => count + 1)} />
}
