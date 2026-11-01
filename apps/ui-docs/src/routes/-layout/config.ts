import type { BaseLayoutProps } from "@fumadocs/base-ui/layouts/shared"

import { APP_CANONICAL_NAME } from "@/common/constants"

export const getBaseLayoutProps = (): BaseLayoutProps => {
  return {
    nav: {
      // JSX supported
      title: APP_CANONICAL_NAME,
    },

    //* Replaced by the UI Kit's `ThemeToggle`, rendered in the sidebar banner.
    themeSwitch: { enabled: false },
  }
}
