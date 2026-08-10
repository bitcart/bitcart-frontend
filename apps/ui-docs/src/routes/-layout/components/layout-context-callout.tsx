import { Callout } from "@fumadocs/base-ui/components/callout"

export const LayoutContextCallout = () => (
  <Callout type="warn" title="Layout context required">
    This component depends on the layout context: make sure{" "}
    <a href="/ui-kit/layout_configuration">LayoutContextProvider</a> is present at the root level of
    the layout.
  </Callout>
)
