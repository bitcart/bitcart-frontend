import { CHECKOUT_PREVIEW_METHODS, CHECKOUT_PREVIEW_STATUSES } from "@bitcart/qa"

import { getPreviewAxisOptions } from "#/checkout/preview/axes"
import { CHECKOUT_PREVIEW_BRAND_IDS } from "#/checkout/preview/brands"
import { CHECKOUT_PALETTE_PRESET_IDS } from "#/checkout/theme/palette"

import type { Route } from "../$templateId"

export const PREVIEW_SHEET_AXES = [
  "status",
  "received",
  "method",
  "palette",
  "brand",
  "width",
] as const

export type PreviewSheetAxis = (typeof PREVIEW_SHEET_AXES)[number]

export type SheetSearch = (typeof Route)["types"]["fullSearchSchema"]

export type SheetFrame = { label: string; width: number; search: SheetSearch }

type FrameVariant = { label: string; search?: Partial<SheetSearch>; width?: number }

const PHONE_WIDTH = 390
const SHEET_WIDTHS = [360, 390, 768, 1024]

const AXIS_VARIANTS: Record<PreviewSheetAxis, (search: SheetSearch) => FrameVariant[]> = {
  //* Each status at its own default received amount.
  status: () =>
    CHECKOUT_PREVIEW_STATUSES.map((status) => ({
      label: status,
      search: { status, received: undefined },
    })),

  received: (search) =>
    getPreviewAxisOptions(search).received.map((received) => ({
      label: received,
      search: { received },
    })),

  method: () => CHECKOUT_PREVIEW_METHODS.map((method) => ({ label: method, search: { method } })),

  palette: () =>
    [undefined, ...CHECKOUT_PALETTE_PRESET_IDS].map((palette) => ({
      label: palette ?? "default",
      search: { palette },
    })),

  brand: () =>
    [undefined, ...CHECKOUT_PREVIEW_BRAND_IDS].map((brand) => ({
      label: brand ?? "bitcart",
      search: { brand },
    })),

  width: () => SHEET_WIDTHS.map((width) => ({ label: `${width} px`, width })),
}

export const getSheetFrames = (axis: PreviewSheetAxis, search: SheetSearch): SheetFrame[] =>
  AXIS_VARIANTS[axis](search).map(({ label, search: variant, width = PHONE_WIDTH }) => ({
    label,
    width,
    search: { ...search, ...variant },
  }))
