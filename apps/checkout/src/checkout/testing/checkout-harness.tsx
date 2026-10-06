import { Toaster } from "@bitcart/ui-kit/components"
import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { LayoutContextProvider, ThemeProvider } from "@bitcart/ui-kit/providers"
import { defineGetLayoutConfig } from "@bitcart/ui-kit/utils"
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import type { ReactNode } from "react"

import { makeSource } from "../fixtures"
import type { CheckoutSource } from "../model"
import type { CheckoutAppConfig } from "../runtime/context"
import { useCheckoutControl, useCheckoutModel } from "../runtime/control"
import { CheckoutProvider } from "../runtime/provider"
import { CheckoutShell, type CheckoutShellTemplate } from "../runtime/shell"

const getTestLayoutConfig = defineGetLayoutConfig(() => ({
  i18n: { activeLocale: "en", availableLocales: ["en"] },
  brand: { name: "Bitcart", logoImageSrc: "/logo.png", logoIcon: BitcartWordmarkIcon },
  navigation: { directory: { labeledLinks: [] } },
}))

export const CheckoutTestProviders = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <ThemeProvider>
      <LayoutContextProvider
        LinkComponent={({ children: linkChildren, ...props }) => <a {...props}>{linkChildren}</a>}
        currentRoute={{ pathname: "/i/invoice-1", pathnameWithHash: "/i/invoice-1", hash: null }}
        layoutConfig={getTestLayoutConfig()}
      >
        {children}
      </LayoutContextProvider>

      <Toaster />
    </ThemeProvider>
  </I18nProvider>
)

export type CheckoutTestAppProps = {
  source?: Partial<CheckoutSource>
  templateId?: string
  screens: CheckoutShellTemplate
  appConfig?: CheckoutAppConfig
}

export const CheckoutTestApp = ({
  source: overrides = {},
  templateId = "test",
  screens,
  appConfig,
}: CheckoutTestAppProps) => {
  const source = makeSource(overrides)
  const control = useCheckoutControl(source.invoice.id)
  const model = useCheckoutModel(source, { selection: screens.selection ?? "preselect", control })

  return (
    <CheckoutTestProviders>
      <CheckoutProvider model={model} appConfig={appConfig}>
        <CheckoutShell templateId={templateId} template={screens} />
      </CheckoutProvider>
    </CheckoutTestProviders>
  )
}
