import { Separator } from "@bitcart/ui-kit/components"

export const VerticalSeparatorExample: React.FC = () => (
  <div className="text-sm gap-4 h-8 flex items-center">
    <span>Docs</span>
    <Separator orientation="vertical" />
    <span>Source</span>
    <Separator orientation="vertical" />
    <span>Community</span>
  </div>
)
