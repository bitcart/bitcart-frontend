import { LAYOUT_CONTAINER_TESTID } from "@bitcart/qa"

import { useLayoutContext } from "@/hooks"

export type LayoutContainerProps = React.ComponentProps<"div"> & {}

/**
 * The outermost element of an app's layout, tagged so E2E tests have a single,
 * app-agnostic readiness signal to wait on.
 *
 * Carries no styling of its own: layouts pass whatever shell classes they need.
 */
export const LayoutContainer: React.FC<LayoutContainerProps> = (props) => {
  const { isHydrated } = useLayoutContext()

  return <div data-is-hydrated={isHydrated} data-testid={LAYOUT_CONTAINER_TESTID} {...props} />
}
