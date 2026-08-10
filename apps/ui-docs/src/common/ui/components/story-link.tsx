import type { BasicLinkComponent } from "@bitcart/ui-kit/types"

export const StoryLink: BasicLinkComponent = ({ a11yHint: _a11yHint, children, ...props }) => (
  <a {...props}>{children}</a>
)
