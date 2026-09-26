import { Toaster } from "@bitcart/ui-kit/components"
import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { LayoutContextProvider, ThemeProvider } from "@bitcart/ui-kit/providers"
import { defineGetLayoutConfig } from "@bitcart/ui-kit/utils"

import { useCheckoutModel, type CheckoutModelOptions, type CheckoutSource } from "../model"
import type { CheckoutAppConfig } from "../runtime/context"
import { CheckoutProvider } from "../runtime/provider"
import { CheckoutShell, type CheckoutScreens } from "../runtime/shell"
import { makeSource } from "./fixtures"

export const CheckoutHarness = ({
  source,
  options,
  screens,
  appConfig,
}: {
  source: CheckoutSource
  options: CheckoutModelOptions
  screens: CheckoutScreens
  appConfig?: CheckoutAppConfig
}) => {
  const model = useCheckoutModel(source, options)

  return (
    <CheckoutProvider model={model} appConfig={appConfig}>
      <CheckoutShell screens={screens} />
    </CheckoutProvider>
  )
}

const getTestLayoutConfig = defineGetLayoutConfig(() => ({
  i18n: { activeLocale: "en", availableLocales: ["en"] },
  brand: { name: "Bitcart", logoImageSrc: "/logo.png", logoIcon: BitcartWordmarkIcon },
  navigation: { directory: { labeledLinks: [] } },
}))

export type CheckoutTestAppProps = {
  source?: Partial<CheckoutSource>
  options?: CheckoutModelOptions
  screens: CheckoutScreens
  appConfig?: CheckoutAppConfig
}

export const CheckoutTestApp = ({
  source = {},
  options = { selection: "preselect" },
  screens,
  appConfig,
}: CheckoutTestAppProps) => (
  <ThemeProvider>
    <LayoutContextProvider
      LinkComponent={({ children, ...props }) => <a {...props}>{children}</a>}
      currentRoute={{ pathname: "/i/invoice-1", pathnameWithHash: "/i/invoice-1", hash: null }}
      layoutConfig={getTestLayoutConfig()}
    >
      <CheckoutHarness
        source={makeSource(source)}
        options={options}
        screens={screens}
        appConfig={appConfig}
      />
    </LayoutContextProvider>

    <Toaster />
  </ThemeProvider>
)
