import { promises as fs } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

import { BitcartApiConfig } from "@bitcart/client-sdk/config"
import { bitcartCryptos } from "@bitcart/client-sdk/endpoints"

import { envConfig } from "../env.config.ts"

const __dirname = dirname(fileURLToPath(import.meta.url))

const PACKAGE_NAME = "@web3icons/react"
const OUTPUT_CATALOG_RELATIVE_MODULE_PATH = "src/common/ui/components/web3icons.generated.ts"

const OUTPUT_CATALOG_MODULE_PATH = join(__dirname, "..", OUTPUT_CATALOG_RELATIVE_MODULE_PATH)
const OUTPUT_TAG = "🪙 web3icons"

const CATALOG_IMPORTS = /* typescript */ `
import type { IconComponentProps } from "@web3icons/react"
import { lazy } from "react"
`.trimStart()

const CATALOG_TYPE_NAME = "LazyIconCatalog"

type IconModule = {
  componentName: string
  hasBackgroundVariant: boolean
}

const CATALOG_TYPE = /* typescript */ `
type ${CATALOG_TYPE_NAME} = Record<
  string,
  React.LazyExoticComponent<
    React.ForwardRefExoticComponent<
      Omit<IconComponentProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >
  >
>
`.trimStart()

const main = async () => {
  BitcartApiConfig.set({ baseUrl: envConfig.sharedEnvSchemas.BITCART_API_URL.parse(undefined) })

  const tokenSymbols = await bitcartCryptos
    .getPaymentMethodCatalog()
    .then(bitcartCryptos.selectPaymentTokenSymbols)

  const iconDirRelativePath = "icons/tokens"

  if (tokenSymbols.length === 0) {
    console.error(`${OUTPUT_TAG}: ⚠️ No token symbols found, aborting.\n`)
  } else {
    console.info(`${OUTPUT_TAG}: Processing ${tokenSymbols.length} token symbols...\n`)

    return Promise.allSettled(
      tokenSymbols.map((tokenSymbol) => {
        const componentName = `Token${tokenSymbol}`

        return import(`${PACKAGE_NAME}/${iconDirRelativePath}/${componentName}`).then(
          ({ __iconNode }: { __iconNode: Record<string, unknown> }) => ({
            componentName,
            hasBackgroundVariant: Object.hasOwn(__iconNode, "background"),
          }),
        )
      }),
    )
      .then((results) =>
        results.reduce(
          (acc, result) => [...acc, ...(result.status === "fulfilled" ? [result.value] : [])],
          [] as IconModule[],
        ),
      )
      .then((iconModules) => {
        const componentNames = iconModules.map(({ componentName }) => componentName)

        if (componentNames.length > 0) {
          const backgroundVariantSet = `export const web3iconsWithBackgroundVariant: ReadonlySet<string> = new Set([\n${iconModules
            .filter(({ hasBackgroundVariant }) => hasBackgroundVariant)
            .map(({ componentName }) => `  "${componentName}",`)
            .sort()
            .join("\n")}\n])`

          const lazyCatalog = `export const web3icons: ${CATALOG_TYPE_NAME} = {\n${componentNames
            .map(
              (componentName) =>
                `  ${
                  componentName
                }: lazy(() => import("${PACKAGE_NAME}/${iconDirRelativePath}/${componentName}")),`,
            )
            .sort()
            .join("\n")}\n}`

          return fs
            .writeFile(
              OUTPUT_CATALOG_MODULE_PATH,
              `${CATALOG_IMPORTS}\n${CATALOG_TYPE}\n${lazyCatalog}\n\n${backgroundVariantSet}\n`,
            )
            .then(() => {
              console.info(`${OUTPUT_TAG}: 📝 Catalog written to ${OUTPUT_CATALOG_MODULE_PATH}\n`)

              console.info(
                `${OUTPUT_TAG}: ✅ ${componentNames.length} exported, 🟥 ${
                  tokenSymbols.length - componentNames.length
                } not found\n`,
              )
            })
            .catch((err) =>
              console.error(
                `${OUTPUT_TAG}: ⚠️ Failed to write icon catalog: ${
                  err instanceof Error ? err.message : err
                }\n`,
              ),
            )
        } else {
          console.error(`${OUTPUT_TAG}: ⚠️ Unable to find any exported icons, aborting.\n`)
        }
      })
  }
}

void main()
