import { WebsiteLayout } from "@bitcart/ui-kit/components"
import type { WithChildren } from "@bitcart/ui-kit/types"
import { useHandleLocaleChange, useI18nInitialization } from "@bitcart/vike-kit/i18n"
import { Link, useClientRoute } from "@bitcart/vike-kit/navigation"
import { i18n as globalI18n } from "@lingui/core"
import { I18nProvider, useLingui } from "@lingui/react"
import { useMemo } from "react"
import { useHydrated } from "vike-react/useHydrated"

import { APP_LOCALE_IDS } from "@/app.config"

import { getLayoutConfig } from "./layout.config"

import "./uno.generated.css"

const PageShell: React.FC<WithChildren> = ({ children }) => {
  const { i18n } = useLingui()
  const route = useClientRoute()
  const hydrated = useHydrated()
  const handleLocaleChange = useHandleLocaleChange({ supportedLocaleIds: APP_LOCALE_IDS })
  const layoutConfig = useMemo(() => getLayoutConfig(i18n), [i18n])

  return (
    <WebsiteLayout
      LinkComponent={Link}
      currentRoute={route}
      config={layoutConfig}
      isHydrated={hydrated}
      localeChangeHandler={handleLocaleChange}
    >
      {children}
    </WebsiteLayout>
  )
}

const Layout: React.FC<WithChildren> = ({ children }) => {
  useI18nInitialization({ supportedLocaleIds: APP_LOCALE_IDS })

  return (
    <I18nProvider i18n={globalI18n}>
      <PageShell>{children}</PageShell>
    </I18nProvider>
  )
}

export default Layout
