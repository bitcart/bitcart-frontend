import { WalletLogo } from "@bitcart/ui-kit/components"

const INJECTED_ICON = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7084ff"/><circle cx="16" cy="16" r="7" fill="#fff"/></svg>',
)}`

export const DefaultWalletLogoExample: React.FC = () => (
  <div className="gap-3 flex items-center">
    <WalletLogo id="metamask" />
    <WalletLogo id="trust" />
    <WalletLogo id="tronlink" />
    <WalletLogo src={INJECTED_ICON} />
    <WalletLogo />
  </div>
)
