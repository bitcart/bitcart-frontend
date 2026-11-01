#!/usr/bin/env node
//* Pairs production screenshots with their local twins and measures how far they differ. Usage:
//*   node compose.ts report --out <dir>
//*   node compose.ts zoom --out <dir> --pair <mode>/<group>/<name>-<viewport> --region <x>,<y>,<width>,<height> [--scale 2]
//* `report` reads <dir>/shots and writes <dir>/report: index.html, img/*.webp, and files.json, the
//* Artifact tool's `files` list for publishing the images beside index.html. Re-running keeps the
//* findings already written between the FINDINGS markers of an existing index.html.
//* `zoom` crops the same region out of one pair's full-size shots into <dir>/zoom/, for details the
//* report's scaled-down images blur. <group> is an app, `states` or `checkout`, as laid out in
//* <dir>/shots, e.g. `dark/directory/index-mobile`.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { join, resolve } from "node:path"
import { parseArgs } from "node:util"

import {
  APPS,
  CHECKOUT,
  CHECKOUT_STEPS,
  STATES,
  VIEWPORTS,
  pageSlug,
  type Clip,
  type Mode,
} from "./targets.ts"

const require = createRequire(resolve(import.meta.dirname, "../../../../package.json"))
const { chromium } = require("@playwright/test") as typeof import("@playwright/test")

const FINDINGS = /<!-- FINDINGS:START -->[\s\S]*?<!-- FINDINGS:END -->/
const CHECKOUT_CARD_WIDTH = 700

//! Pixels count as visibly different past 24 of 255 luminance levels (about 10%), and as shifted
//! in shade past 4. A pair is identical only when no pixel differs at all and the sizes match.
//! Canvas limits keep a composite under 16,000px tall.
const VISIBLE_THRESHOLD = 24
const SHADE_THRESHOLD = 4
const MAX_HEIGHT = 16_000

type PairOptions = {
  labels: [string, string]
  scale: number
  crop?: Clip
  format?: "image/webp" | "image/png"
}

type PairStats = {
  visible: number
  shade: number
  sameSize: boolean
  identical: boolean
  prod: string
  local: string
}

type Item = { title: string; subtitle?: string; key: string; viewports: string[] }

type Group = {
  title: string
  layout: "closeups" | "pages"
  labels: [string, string]
  items: Item[]
}

const { positionals, values } = parseArgs({
  allowPositionals: true,

  options: {
    out: { type: "string" },
    pair: { type: "string" },
    region: { type: "string" },
    scale: { type: "string", default: "2" },
  },
})

const command = positionals[0]
const host = (url: string) => new URL(url).host
const pngWidth = (png: Buffer) => png.readUInt32BE(16)
const productionLabels: [string, string] = ["production", "localhost"]
const browser = await chromium.launch()
const page = await browser.newPage()

const composePair = async (prodPng: Buffer, localPng: Buffer, options: PairOptions) => {
  const { encoded, stats } = await page.evaluate(
    async ({ prodSrc, localSrc, labels, scale, crop, format, limits }) => {
      const load = async (src: string) => {
        const image = new Image()
        image.src = `data:image/png;base64,${src}`
        await image.decode()

        return image
      }

      const pixelsOf = (image: HTMLImageElement) => {
        const context = new OffscreenCanvas(image.width, image.height).getContext("2d")!
        context.drawImage(image, 0, 0)

        return context.getImageData(0, 0, image.width, image.height)
      }

      const dominantColors = ({ data, width, height }: ImageData) => {
        const counts = new Map<number, number>()
        let total = 0

        for (let y = 0; y < height; y += 4) {
          for (let x = 0; x < width; x += 4) {
            const i = (y * width + x) * 4
            const color = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
            counts.set(color, (counts.get(color) ?? 0) + 1)
            total++
          }
        }

        return [...counts]
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([color, count]) => [color, Math.floor((count * 100) / total)] as const)
          .filter(([, share]) => share >= 4)
          .map(
            ([color, share]) => `#${color.toString(16).padStart(6, "0").toUpperCase()} ${share}%`,
          )
          .join(" · ")
      }

      const [prod, local] = await Promise.all([load(prodSrc), load(localSrc)])
      const [a, b] = [pixelsOf(prod), pixelsOf(local)]
      const width = Math.min(a.width, b.width)
      const height = Math.min(a.height, b.height)
      let visible = 0
      let shade = 0
      let changed = 0

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * a.width + x) * 4
          const j = (y * b.width + x) * 4

          const delta =
            0.299 * Math.abs(a.data[i] - b.data[j]) +
            0.587 * Math.abs(a.data[i + 1] - b.data[j + 1]) +
            0.114 * Math.abs(a.data[i + 2] - b.data[j + 2])

          if (delta > limits.visible) visible++
          if (delta > limits.shade) shade++
          if (delta > 0) changed++
        }
      }

      const percent = (count: number) => Math.round((count / (a.width * height)) * 1000) / 10

      const area = (image: HTMLImageElement) => {
        const x = Math.min(Math.max(0, crop?.x ?? 0), image.width)
        const y = Math.min(Math.max(0, crop?.y ?? 0), image.height)

        return {
          x,
          y,
          width: Math.min(crop?.width ?? image.width, image.width - x),
          height: Math.min(crop?.height ?? image.height, image.height - y),
        }
      }

      const [areaA, areaB] = [area(prod), area(local)]
      const head = 32
      const gap = 16
      const fit = Math.min(scale, (limits.maxHeight - head) / Math.max(areaA.height, areaB.height))

      const canvas = new OffscreenCanvas(
        Math.round((areaA.width + areaB.width) * fit + gap),
        Math.round(Math.max(areaA.height, areaB.height) * fit + head),
      )

      const context = canvas.getContext("2d")!
      context.imageSmoothingQuality = "high"
      context.fillStyle = "#786e82"
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = "#1f0938"
      context.fillRect(0, 0, canvas.width, head)
      context.fillStyle = "#ffffff"
      context.font = "600 17px system-ui, sans-serif"
      context.textBaseline = "middle"
      context.fillText(labels[0], 10, head / 2)
      context.fillText(labels[1], areaA.width * fit + gap + 10, head / 2)

      for (const [image, region, left] of [
        [prod, areaA, 0],
        [local, areaB, areaA.width * fit + gap],
      ] as const) {
        context.drawImage(
          image,
          region.x,
          region.y,
          region.width,
          region.height,
          left,
          head,
          region.width * fit,
          region.height * fit,
        )
      }

      const bytes = new Uint8Array(
        await (await canvas.convertToBlob({ type: format, quality: 0.8 })).arrayBuffer(),
      )

      let binary = ""

      for (let offset = 0; offset < bytes.length; offset += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
      }

      const sameSize = a.width === b.width && a.height === b.height

      return {
        encoded: btoa(binary),

        stats: {
          visible: percent(visible),
          shade: percent(shade),
          sameSize,
          identical: sameSize && changed === 0,
          prod: dominantColors(a),
          local: dominantColors(b),
        },
      }
    },

    {
      prodSrc: prodPng.toString("base64"),
      localSrc: localPng.toString("base64"),
      labels: options.labels,
      scale: options.scale,
      crop: options.crop,
      format: options.format ?? "image/webp",
      limits: { visible: VISIBLE_THRESHOLD, shade: SHADE_THRESHOLD, maxHeight: MAX_HEIGHT },
    },
  )

  return { image: Buffer.from(encoded, "base64"), stats: stats as PairStats }
}

const describePair = ({ identical, sameSize }: PairStats) => {
  if (identical) {
    return "  identical"
  } else if (!sameSize) {
    return "  (heights differ)"
  } else return ""
}

const writeReport = async (out: string) => {
  const shots = resolve(out, "shots")
  const reportDir = resolve(out, "report")
  mkdirSync(join(reportDir, "img"), { recursive: true })

  const modes = (["light", "dark"] as Mode[]).filter((mode) => existsSync(join(shots, mode)))
  const stats: Record<string, PairStats> = {}
  const files: { path: string }[] = []
  const groups: Group[] = []

  //* Adds every viewport whose production and local shots both exist, in any captured mode.
  const pairUp = async (
    shotBase: (mode: Mode) => string,
    key: string,
    options: (viewport: string, prodPng: Buffer) => PairOptions,
  ) => {
    const viewports: string[] = []

    for (const viewport of Object.keys(VIEWPORTS)) {
      for (const mode of modes) {
        const [prodFile, localFile] = ["prod", "local"].map(
          (site) => `${shotBase(mode)}-${viewport}-${site}.png`,
        )

        if (existsSync(prodFile) && existsSync(localFile)) {
          const prodPng = readFileSync(prodFile)

          const { image, stats: pairStats } = await composePair(
            prodPng,
            readFileSync(localFile),
            options(viewport, prodPng),
          )

          const published = `img/${mode}-${key}-${viewport}.webp`
          writeFileSync(join(reportDir, published), image)
          files.push({ path: published })
          stats[`${mode}/${key}-${viewport}`] = pairStats
          if (!viewports.includes(viewport)) viewports.push(viewport)
        }
      }
    }

    return viewports
  }

  const stateItems: Item[] = []

  for (const state of STATES) {
    const key = `state-${state.app}-${state.name}`

    const viewports = await pairUp(
      (mode) => join(shots, mode, "states", `${state.app}-${state.name}`),
      key,
      () => ({ labels: productionLabels, scale: 1 }),
    )

    if (viewports.length) stateItems.push({ title: state.title, key, viewports })
  }

  if (stateItems.length) {
    groups.push({
      title: "Interactive states",
      layout: "closeups",
      labels: productionLabels,
      items: stateItems,
    })
  }

  const checkoutLabels: [string, string] = [host(CHECKOUT.prod), host(CHECKOUT.local)]
  const checkoutItems: Item[] = []

  for (const { name, title } of [...CHECKOUT_STEPS.email, ...CHECKOUT_STEPS.payment]) {
    const key = `checkout-${name}`

    const viewports = await pairUp(
      (mode) => join(shots, mode, "checkout", name),
      key,
      (viewport, prodPng) => ({
        labels: checkoutLabels,
        scale: viewport === "desktop" ? 0.8 : 1,

        crop:
          viewport === "desktop"
            ? {
                x: (pngWidth(prodPng) - CHECKOUT_CARD_WIDTH) / 2,
                y: 0,
                width: CHECKOUT_CARD_WIDTH,
                height: 900,
              }
            : undefined,
      }),
    )

    if (viewports.length) checkoutItems.push({ title, key, viewports })
  }

  if (checkoutItems.length) {
    groups.push({
      title: `Checkout: ${checkoutLabels[0]} vs ${checkoutLabels[1]}`,
      layout: "closeups",
      labels: checkoutLabels,
      items: checkoutItems,
    })
  }

  for (const [app, { title, pages, prod, local }] of Object.entries(APPS)) {
    const items: Item[] = []

    for (const path of pages) {
      const key = `${app}-${pageSlug(path)}`

      const viewports = await pairUp(
        (mode) => join(shots, mode, app, pageSlug(path)),
        key,
        (viewport) => ({ labels: productionLabels, scale: viewport === "desktop" ? 0.5 : 1 }),
      )

      if (viewports.length) items.push({ title: path, subtitle: host(prod) + path, key, viewports })
    }

    if (items.length) {
      groups.push({
        title: `${title}: ${host(prod)} vs ${host(local)}`,
        layout: "pages",
        labels: productionLabels,
        items,
      })
    }
  }

  const data = { generated: new Date().toISOString().slice(0, 10), modes, groups, stats }
  const indexFile = join(reportDir, "index.html")
  const template = readFileSync(join(import.meta.dirname, "../report/template.html"), "utf8")

  const previous = existsSync(indexFile)
    ? readFileSync(indexFile, "utf8").match(FINDINGS)?.[0]
    : undefined

  let html = template.replace("/*__DATA__*/ null", () => JSON.stringify(data))
  if (previous) html = html.replace(FINDINGS, () => previous)
  writeFileSync(indexFile, html)
  writeFileSync(join(reportDir, "files.json"), JSON.stringify(files, null, 2))

  for (const [key, pairStats] of Object.entries(stats).sort(
    ([, a], [, b]) => b.visible - a.visible,
  )) {
    const { visible, shade } = pairStats

    console.log(
      `${key.padEnd(52)} visible ${String(visible).padStart(5)}%  shade ${String(shade).padStart(5)}%${describePair(pairStats)}`,
    )
  }

  console.log(`\n${files.length} images → ${indexFile}`)
}

const writeZoom = async (out: string, pair: string, region: Clip, scale: number) => {
  const base = resolve(out, "shots", pair)
  const zoomDir = resolve(out, "zoom")
  const { x, y, width, height } = region
  const file = join(zoomDir, `${pair.replaceAll("/", "-")}-${x}-${y}-${width}x${height}.png`)
  mkdirSync(zoomDir, { recursive: true })

  const { image } = await composePair(
    readFileSync(`${base}-prod.png`),
    readFileSync(`${base}-local.png`),
    { labels: productionLabels, scale, crop: region, format: "image/png" },
  )

  writeFileSync(file, image)
  console.log(file)
}

const [x, y, width, height] = (values.region ?? "").split(",").map(Number)
const region = { x, y, width, height }

if (command === "report" && values.out) {
  await writeReport(values.out)
} else if (
  command === "zoom" &&
  values.out &&
  values.pair &&
  Object.values(region).every(Number.isFinite)
) {
  await writeZoom(values.out, values.pair, region, Number(values.scale))
} else {
  console.error("Usage: see the header of compose.ts")
  process.exitCode = 2
}

await browser.close()
