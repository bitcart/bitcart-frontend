import {
  CHECKOUT_PREVIEW_CASE_IDS,
  CHECKOUT_PREVIEW_CASES,
  CHECKOUT_PREVIEW_ENVIRONMENTS,
  CHECKOUT_PREVIEW_EXPIRATIONS,
  CHECKOUT_PREVIEW_METHODS,
  CHECKOUT_PREVIEW_STATUSES,
  CHECKOUT_PREVIEW_VIEWS,
  CHECKOUT_PREVIEW_WALLETS,
  type CheckoutPreviewAxes,
  type CheckoutPreviewCase,
  type CheckoutPreviewCaseId,
  type CheckoutPreviewEnvironment,
  type CheckoutPreviewExpiration,
  type CheckoutPreviewStatus,
  type CheckoutPreviewView,
  type CheckoutPreviewWallet,
} from "@bitcart/qa"
import {
  Button,
  ButtonGroup,
  Drawer,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  ToggleGroupItem,
} from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useNavigate, useSearch } from "@tanstack/react-router"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { Fragment } from "react"
import { isDeepEqual } from "remeda"

import { getPreviewAxisOptions, normalizePreviewAxes } from "#/checkout/preview/axes"
import { CHECKOUT_PREVIEW_BRAND_IDS, type CheckoutPreviewBrand } from "#/checkout/preview/brands"
import {
  CHECKOUT_PREVIEW_SPEED_IDS,
  type CheckoutPreviewSpeed,
} from "#/checkout/preview/expiration"
import { PreviewToggleGroup } from "#/checkout/preview/toolbar"
import { CHECKOUT_PALETTE_PRESET_IDS } from "#/checkout/theme/palette"
import type { CheckoutPalettePresetId } from "#/checkout/theme/presets"

import { PREVIEW_SHEET_AXES, type PreviewSheetAxis } from "./sheet"

//! A developer tool, never shown to customers: option ids are used as labels.

type PreviewSearch = CheckoutPreviewAxes & {
  view: CheckoutPreviewView
  environment?: CheckoutPreviewEnvironment
  wallet?: CheckoutPreviewWallet
  expiration?: CheckoutPreviewExpiration
  speed?: CheckoutPreviewSpeed
  palette?: CheckoutPalettePresetId
  brand?: CheckoutPreviewBrand
  sheet?: PreviewSheetAxis
}

const STATUS_GROUP_LABELS = ["Payment", "Confirming", "Final"] as const

const STATUS_GROUPS: Record<CheckoutPreviewStatus, (typeof STATUS_GROUP_LABELS)[number]> = {
  new: "Payment",
  details: "Payment",
  unavailable: "Payment",
  paid: "Confirming",
  complete: "Final",
  expired: "Final",
  invalid: "Final",
  refunded: "Final",
  "refund-unclaimed": "Final",
  "refund-pending": "Final",
  "refund-failed": "Final",
  unknown: "Final",
}

const STATUS_OPTION_GROUPS = STATUS_GROUP_LABELS.map((label) => ({
  label,
  options: CHECKOUT_PREVIEW_STATUSES.filter((status) => STATUS_GROUPS[status] === label),
}))

const CUSTOM_CASE = "custom"
const BROWSER = "browser"
const DEFAULT_EXPIRATION = "15m-default"
const REAL_TIME = "1x"
const DEFAULT_PALETTE = "default"
const NO_BRAND = "bitcart"
const NO_SHEET = "off"
const NO_WALLET = "none"

const PRICING_FLAGS = [
  ["discount", "discount"],
  ["fee", "network cost"],
  ["anyAmount", "any amount"],
  ["recommendedFee", "recommended fee"],
] as const

const WALLET_FLAGS = [["senderAddress", "sender address"]] as const

const STRESS_FLAGS = [
  ["longPrice", "long price"],
  ["longName", "long name"],
  ["longCoin", "long coin"],
  ["customLabel", "custom label"],
  ["duplicateCoin", "duplicate coin"],
  ["manyMethods", "many methods"],
] as const

type PreviewFlag =
  | (typeof PRICING_FLAGS)[number][0]
  | (typeof WALLET_FLAGS)[number][0]
  | (typeof STRESS_FLAGS)[number][0]

const findCase = (search: PreviewSearch): CheckoutPreviewCaseId | typeof CUSTOM_CASE => {
  const current = { ...normalizePreviewAxes(search), expiration: search.expiration }

  return (
    CHECKOUT_PREVIEW_CASE_IDS.find((id) => {
      const { expiration, ...axes }: CheckoutPreviewCase = CHECKOUT_PREVIEW_CASES[id]

      return isDeepEqual({ ...normalizePreviewAxes(axes), expiration }, current)
    }) ?? CUSTOM_CASE
  )
}

type OptionGroup<T extends string> = { label?: string; options: readonly T[] }

const FIELD_CLASS_NAME = "gap-2 grid grid-cols-[6rem_minmax(0,1fr)] items-center"
const FIELD_LABEL_CLASS_NAME = "text-sm text-muted-foreground"

type ToolbarSelectProps<T extends string> = {
  label: string
  value: T
  groups: OptionGroup<T>[]
  onChange: (value: T) => void
  hasStepper?: boolean
  disabled?: boolean
}

const ToolbarSelect = <T extends string>({
  label,
  value,
  groups,
  onChange,
  hasStepper = false,
  disabled = false,
}: ToolbarSelectProps<T>) => {
  const options = groups.flatMap((group) => group.options)
  const index = options.indexOf(value)
  const previous = options[index - 1]
  const next = options[index + 1]
  const name = label.toLowerCase()

  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(selected) => selected !== null && onChange(selected)}
    >
      <div className={FIELD_CLASS_NAME}>
        <SelectLabel className={FIELD_LABEL_CLASS_NAME}>{label}</SelectLabel>

        <ButtonGroup className="min-w-0 w-full">
          {hasStepper && (
            <Button
              variant="outline"
              size="icon"
              aria-label={`Previous ${name}`}
              disabled={previous === undefined}
              onClick={() => previous !== undefined && onChange(previous)}
            >
              <ChevronLeftIcon />
            </Button>
          )}

          <SelectTrigger size="sm" className="min-w-0 flex-1">
            <SelectValue />
          </SelectTrigger>

          {hasStepper && (
            <Button
              variant="outline"
              size="icon"
              aria-label={`Next ${name}`}
              disabled={next === undefined}
              onClick={() => next !== undefined && onChange(next)}
            >
              <ChevronRightIcon />
            </Button>
          )}
        </ButtonGroup>
      </div>

      <SelectContent alignItemWithTrigger={false} align="start">
        {groups.map(({ label: groupLabel, options: groupOptions }, groupIndex) => (
          <Fragment key={groupLabel ?? groupIndex}>
            {groupIndex > 0 && <SelectSeparator />}

            <SelectGroup>
              {groupLabel && <SelectGroupLabel>{groupLabel}</SelectGroupLabel>}

              {groupOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </Fragment>
        ))}
      </SelectContent>
    </Select>
  )
}

const ToolbarToggles = <T extends string>({
  label,
  items,
  value,
  onChange,
  isMultiple = false,
}: {
  label: string
  items: readonly (readonly [T, string, boolean?])[]
  value: T[]
  onChange: (value: T[]) => void
  isMultiple?: boolean
}) => (
  <div className={cn(FIELD_CLASS_NAME, "items-start")}>
    <span aria-hidden className={cn(FIELD_LABEL_CLASS_NAME, "py-1.5")}>
      {label}
    </span>

    <PreviewToggleGroup
      multiple={isMultiple}
      size="sm"
      aria-label={label}
      value={value}
      onValueChange={(selected) =>
        onChange(items.map(([item]) => item).filter((item) => selected.includes(item)))
      }
    >
      {items.map(([item, itemLabel, isDisabled]) => (
        <ToggleGroupItem key={item} value={item} disabled={isDisabled}>
          {itemLabel}
        </ToggleGroupItem>
      ))}
    </PreviewToggleGroup>
  </div>
)

const ToolbarGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div role="group" aria-label={label} className="gap-3 flex flex-col">
    <h2 aria-hidden className="text-sm font-medium">
      {label}
    </h2>

    {children}
  </div>
)

const usePreviewSearch = () => {
  const search = useSearch({ from: "/preview/$templateId" })
  const navigate = useNavigate({ from: "/preview/$templateId" })

  const update = (patch: Partial<PreviewSearch>) =>
    void navigate({ search: (previous) => ({ ...previous, ...patch }) })

  return { search, navigate, update }
}

export const PreviewOptions = () => {
  const { search, navigate, update } = usePreviewSearch()
  const axes = normalizePreviewAxes(search)
  const options = getPreviewAxisOptions(search)

  const applyCase = (id: CheckoutPreviewCaseId) =>
    void navigate({
      search: ({ view, environment, wallet, speed, palette, brand }) => ({
        view,
        environment,
        wallet,
        speed,
        palette,
        brand,
        ...CHECKOUT_PREVIEW_CASES[id],
      }),
    })

  const setFlags = (flags: readonly PreviewFlag[], enabled: PreviewFlag[]) =>
    update(
      Object.fromEntries(
        flags.map((flag) => {
          const isEnabled = enabled.includes(flag)
          const isDefault = flag === "recommendedFee" ? isEnabled : !isEnabled

          return [flag, isDefault ? undefined : isEnabled]
        }),
      ),
    )

  const flagItems = (
    flags: readonly (readonly [PreviewFlag, string])[],
    availability: Partial<Record<PreviewFlag, boolean>> = {},
  ) => flags.map(([flag, flagLabel]) => [flag, flagLabel, availability[flag] === false] as const)

  const enabledFlags = (flags: readonly (readonly [PreviewFlag, string])[]) =>
    flags.filter(([flag]) => axes[flag]).map(([flag]) => flag)

  return (
    <section aria-label="Preview options" className="gap-6 flex flex-col">
      <ToolbarGroup label="Invoice">
        <ToolbarSelect
          label="Status"
          value={search.status}
          groups={STATUS_OPTION_GROUPS}
          onChange={(status) => update({ status, received: undefined })}
          hasStepper
        />

        <ToolbarSelect
          label="Preset"
          value={findCase(search)}
          groups={[{ options: [CUSTOM_CASE] }, { options: CHECKOUT_PREVIEW_CASE_IDS }]}
          onChange={(id) => id !== CUSTOM_CASE && applyCase(id)}
        />

        <ToolbarSelect
          label="Received"
          value={axes.received}
          groups={[{ options: options.received }]}
          disabled={options.received.length < 2}
          onChange={(received) => update({ received })}
        />

        <ToolbarSelect
          label="Method"
          value={axes.method}
          groups={[{ options: CHECKOUT_PREVIEW_METHODS }]}
          disabled={search.status === "unavailable"}
          onChange={(method) => update({ method: method === "btc" ? undefined : method })}
        />

        <ToolbarToggles
          label="Pricing"
          items={flagItems(PRICING_FLAGS, options)}
          value={enabledFlags(PRICING_FLAGS)}
          onChange={(enabled) =>
            setFlags(
              PRICING_FLAGS.map(([flag]) => flag),
              enabled,
            )
          }
          isMultiple
        />

        <ToolbarToggles
          label="Wallet"
          items={flagItems(WALLET_FLAGS, options)}
          value={enabledFlags(WALLET_FLAGS)}
          onChange={(enabled) =>
            setFlags(
              WALLET_FLAGS.map(([flag]) => flag),
              enabled,
            )
          }
          isMultiple
        />

        <ToolbarSelect
          label="Browser wallet"
          value={search.wallet ?? NO_WALLET}
          groups={[{ options: [NO_WALLET, ...CHECKOUT_PREVIEW_WALLETS] }]}
          onChange={(wallet) => update({ wallet: wallet === NO_WALLET ? undefined : wallet })}
        />
      </ToolbarGroup>

      <ToolbarGroup label="Display">
        <ToolbarToggles
          label="View"
          items={CHECKOUT_PREVIEW_VIEWS.map((view) => [view, view] as const)}
          value={[search.view]}
          onChange={([view]) => view && update({ view })}
        />

        <ToolbarSelect
          label="Environment"
          value={search.environment ?? BROWSER}
          groups={[{ options: [BROWSER, ...CHECKOUT_PREVIEW_ENVIRONMENTS] }]}
          onChange={(environment) =>
            update({ environment: environment === BROWSER ? undefined : environment })
          }
        />

        <ToolbarSelect
          label="Expiration"
          value={search.expiration ?? DEFAULT_EXPIRATION}
          groups={[{ options: [DEFAULT_EXPIRATION, ...CHECKOUT_PREVIEW_EXPIRATIONS] }]}
          onChange={(expiration) =>
            update({ expiration: expiration === DEFAULT_EXPIRATION ? undefined : expiration })
          }
        />

        <ToolbarSelect
          label="Speed"
          value={search.speed ?? REAL_TIME}
          groups={[{ options: [REAL_TIME, ...CHECKOUT_PREVIEW_SPEED_IDS] }]}
          onChange={(speed) => update({ speed: speed === REAL_TIME ? undefined : speed })}
        />

        <ToolbarSelect
          label="Palette"
          value={search.palette ?? DEFAULT_PALETTE}
          groups={[{ options: [DEFAULT_PALETTE, ...CHECKOUT_PALETTE_PRESET_IDS] }]}
          onChange={(palette) =>
            update({ palette: palette === DEFAULT_PALETTE ? undefined : palette })
          }
        />

        <ToolbarSelect
          label="Brand"
          value={search.brand ?? NO_BRAND}
          groups={[{ options: [NO_BRAND, ...CHECKOUT_PREVIEW_BRAND_IDS] }]}
          onChange={(brand) => update({ brand: brand === NO_BRAND ? undefined : brand })}
        />

        <ToolbarSelect
          label="Sheet"
          value={search.sheet ?? NO_SHEET}
          groups={[{ options: [NO_SHEET, ...PREVIEW_SHEET_AXES] }]}
          onChange={(sheet) => update({ sheet: sheet === NO_SHEET ? undefined : sheet })}
        />

        <ToolbarToggles
          label="Stress"
          items={flagItems(STRESS_FLAGS)}
          value={enabledFlags(STRESS_FLAGS)}
          onChange={(enabled) =>
            setFlags(
              STRESS_FLAGS.map(([flag]) => flag),
              enabled,
            )
          }
          isMultiple
        />
      </ToolbarGroup>
    </section>
  )
}

const SURFACE_CLASS_NAME = "rounded-xl border-border bg-card border"

export const PreviewOptionsPanel = ({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean
  onToggle: () => void
}) => {
  const toggle = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isCollapsed ? "Show options" : "Hide options"}
      aria-expanded={!isCollapsed}
      onClick={onToggle}
    >
      {isCollapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
    </Button>
  )

  return (
    <aside
      className={cn(
        SURFACE_CLASS_NAME,
        "top-4 sticky max-h-[calc(100dvh-2rem)] shrink-0 overflow-y-auto",
        isCollapsed ? "p-1" : "w-88 p-4 pt-2",
      )}
    >
      {isCollapsed ? (
        toggle
      ) : (
        <>
          <div className="mb-2 -me-2 flex items-center justify-between">
            <p className="font-semibold">Preview options</p>
            {toggle}
          </div>

          <PreviewOptions />
        </>
      )}
    </aside>
  )
}

const getSummary = (search: PreviewSearch) => {
  const { status, received, method } = normalizePreviewAxes(search)

  return [
    status,
    received !== "none" && received,
    method,
    search.view === "receipt" && "receipt",
    search.environment,
    search.expiration,
    search.speed,
    search.palette,
    search.brand,
    search.sheet && `sheet: ${search.sheet}`,
  ]
    .filter(Boolean)
    .join(" · ")
}

const OptionsSheet = () => (
  <Drawer position="bottom">
    <DrawerTrigger render={<Button variant="outline" size="sm" />}>
      <SlidersHorizontalIcon />
      Options
    </DrawerTrigger>

    <DrawerPopup>
      <DrawerHeader>
        <DrawerTitle>Preview options</DrawerTitle>
      </DrawerHeader>

      <DrawerPanel>
        <PreviewOptions />
      </DrawerPanel>
    </DrawerPopup>
  </Drawer>
)

export const PreviewOptionsBar = () => {
  const { search } = usePreviewSearch()

  return (
    <div
      className={cn(
        SURFACE_CLASS_NAME,
        "gap-3 py-2 ps-4 pe-2 top-0 sticky z-10 flex w-full items-center",
      )}
    >
      <p className="min-w-0 text-sm flex-1 truncate">{getSummary(search)}</p>

      <OptionsSheet />
    </div>
  )
}
