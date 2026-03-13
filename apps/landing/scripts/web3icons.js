import { promises as fs } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

import { bitcartClient } from "../src/common/data/bitcart/index.ts"

const __dirname = dirname(fileURLToPath(import.meta.url))

const PACKAGE_NAME = "@web3icons/react"
const OUTPUT_CATALOG_RELATIVE_MODULE_PATH = "src/common/ui/components/web3icons.generated.ts"

const PACKAGE_DIST_PATH = join(__dirname, `../node_modules/${PACKAGE_NAME}/dist`)
const OUTPUT_CATALOG_MODULE_PATH = join(__dirname, "..", OUTPUT_CATALOG_RELATIVE_MODULE_PATH)
const OUTPUT_TAG = "🪙 web3icons"

const CATALOG_IMPORTS = /* typescript */ `
import type { IconComponentProps } from "@web3icons/react"
import { lazy } from "react"
`.trimStart()

const CATALOG_TYPE_NAME = "LazyIconCatalog"

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
  // FIXME: Consider implementing retry logic and error handling
  const tokenSymbols = await bitcartClient.getSupportedFungibleTokenSymbols()
  const iconDirRelativePath = "icons/tokens"
  const iconModuleDirPath = join(PACKAGE_DIST_PATH, iconDirRelativePath)
  const componentNames = []

  console.info(`${OUTPUT_TAG}: Processing ${tokenSymbols.length} token symbols...\n`)

  return Promise.allSettled(
    tokenSymbols.map((tokenSymbol) => {
      const componentName = `Token${tokenSymbol}`
      const moduleFilePath = join(iconModuleDirPath, `${componentName}.js`)

      return fs.access(moduleFilePath).then(() => void componentNames.push(componentName))
    }),
  ).then(() => {
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
        `${CATALOG_IMPORTS}\n${CATALOG_TYPE}\n${lazyCatalog}\n`,
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
          `${OUTPUT_TAG}: ⚠️ Failed to write icon catalog: ${err instanceof Error ? err.message : err}\n`,
        ),
      )
  })
}

void main()
