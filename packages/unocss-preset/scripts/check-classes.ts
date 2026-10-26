#!/usr/bin/env node

import { existsSync } from "node:fs"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { presetBitcart } from "@bitcart/unocss-preset"
import { loadConfig } from "@unocss/config"
import { createGenerator, type UserConfig } from "unocss"

const TAILWIND_DIFFERENCES = [
  {
    pattern: /(?:^|:)not-dark:/,
    note: "`not-dark:` is a `prefers-color-scheme` media query here, while our `dark:` is the `.dark` class",
  },

  {
    pattern: /(?:^|:)(?:before|after):/,
    note: "a preflight gives this pseudo-element `content` under any variant: keep it `absolute` so it stays out of the layout",
  },

  {
    pattern: /(?:^|:)\[:/,
    note: "an arbitrary variant needs `&`: write `[&:…]:`",
  },

  {
    pattern: /(?:^|:)not-data-\[/,
    note: "write `not-[[data-…]]:` instead of `not-data-[…]:`",
  },

  {
    pattern: /--theme\(/,
    note: "`--theme()` in an arbitrary value throws or emits invalid CSS: use a literal value such as `rgb(0_0_0/4%)`",
  },
]

const APPS_ROOT = new URL("../../../apps/", import.meta.url)

type Generated = { ok: boolean; output: string }

const fail = (message: string): never => {
  console.error(message)
  process.exit(1)
}

const parseArgs = (args: string[]) => {
  const appFlagIndex = args.indexOf("--app")
  const classArgs = appFlagIndex === -1 ? args : args.toSpliced(appFlagIndex, 2)

  return {
    app:
      appFlagIndex === -1
        ? undefined
        : args[appFlagIndex + 1] || fail("--app needs an app name, e.g. --app checkout"),

    classes: [...new Set(classArgs.flatMap((arg) => arg.split(/\s+/)))].filter(Boolean),
  }
}

const loadAppConfig = async (app: string): Promise<UserConfig> => {
  const configPath = fileURLToPath(new URL(`${app}/uno.config.ts`, APPS_ROOT))

  if (!existsSync(configPath)) {
    return fail(`apps/${app}/uno.config.ts not found`)
  } else return (await loadConfig(dirname(configPath), configPath)).config
}

const { app, classes } = parseArgs(process.argv.slice(2))

const uno = await createGenerator(app ? await loadAppConfig(app) : { presets: [presetBitcart()] })

const generate = async (utility: string): Promise<Generated> => {
  try {
    const { css } = await uno.generate(new Set([utility]), { preflights: false, safelist: false })

    const rules = css
      .split("\n")
      .filter((line) => line && !line.startsWith("/*") && !line.startsWith("@property"))
      .join("\n")

    return rules
      ? { ok: true, output: `✓ ${utility}\n${rules.replace(/^/gm, "    ")}` }
      : { ok: false, output: `✗ ${utility}  (no CSS)` }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return { ok: false, output: `✗ ${utility}  (${message})` }
  }
}

let failures = 0

for (const utility of classes) {
  const { ok, output } = await generate(utility)

  if (!ok) failures++

  console.log(output)

  for (const { pattern, note } of TAILWIND_DIFFERENCES) {
    if (pattern.test(utility)) console.log(`    ! ${note}`)
  }
}

if (failures > 0 && !app) {
  console.log("\nA class that only an app's uno.config.ts defines needs --app <name>.")
}

process.exitCode = failures > 0 ? 1 : 0
