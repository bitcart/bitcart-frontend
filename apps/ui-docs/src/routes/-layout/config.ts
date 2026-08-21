import type { BaseLayoutProps } from "@fumadocs/base-ui/layouts/shared"

import { APP_CANONICAL_NAME } from "@/common/constants"

export const getBaseLayoutProps = (): BaseLayoutProps => {
  return {
    nav: {
      // JSX supported
      title: APP_CANONICAL_NAME,
    },

    //* Replaced by ThemeSelector: the built-in switch only cycles light/dark/system
    //* and would write theme keys the brand-aware theming can't interpret.
    themeSwitch: { enabled: false },
  }
}
