import type { ClientRoute } from "@bitcart/core/navigation"
import { setupI18n, type I18n } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { I18nProvider, useLingui } from "@lingui/react"
import { act, cleanup, render, screen } from "@testing-library/react"
import { useMemo } from "react"
import { afterEach, describe, expect, test } from "vitest"

import { useLayoutContext } from "@/hooks"
import { defineGetLayoutConfig } from "@/utils"

import { LayoutContextProvider } from "./layout-context"

const TAGLINE = msg`Crypto payments`
const CURRENT_ROUTE: ClientRoute = { pathname: "/", pathnameWithHash: "/", hash: null }

const getLayoutConfig = defineGetLayoutConfig((i18n: I18n) => ({
  i18n: { activeLocale: i18n.locale, availableLocales: ["en", "de"] },
  brand: { name: "Bitcart", tagline: i18n.t(TAGLINE), logoImageSrc: "/logo.svg" },
  navigation: { directory: { labeledLinks: [] } },
}))

const Link = ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>

const Tagline = () => {
  const { layoutConfig } = useLayoutContext()

  return <p>{`${layoutConfig.i18n.activeLocale}: ${layoutConfig.brand.tagline}`}</p>
}

const Shell = () => {
  const { i18n } = useLingui()
  const layoutConfig = useMemo(() => getLayoutConfig(i18n), [i18n])

  return (
    <LayoutContextProvider
      LinkComponent={Link}
      currentRoute={CURRENT_ROUTE}
      layoutConfig={layoutConfig}
    >
      <Tagline />
    </LayoutContextProvider>
  )
}

//* A dedicated instance leaves the global one inactive: a config reading it would fail here.
const renderShell = () => {
  const i18n = setupI18n()

  i18n.load({ en: { [TAGLINE.id]: "Crypto payments" }, de: { [TAGLINE.id]: "Krypto-Zahlungen" } })
  i18n.activate("en")

  render(
    <I18nProvider i18n={i18n}>
      <Shell />
    </I18nProvider>,
  )

  return i18n
}

afterEach(() => {
  cleanup()
})

describe("LayoutContextProvider", () => {
  test("follows a locale switch", () => {
    const i18n = renderShell()

    act(() => i18n.activate("de"))

    expect(screen.getByText("de: Krypto-Zahlungen")).toBeDefined()
  })

  test("follows a catalog loaded into the active locale", () => {
    const i18n = renderShell()

    act(() => i18n.load("en", { [TAGLINE.id]: "Accept crypto" }))

    expect(screen.getByText("en: Accept crypto")).toBeDefined()
  })
})
