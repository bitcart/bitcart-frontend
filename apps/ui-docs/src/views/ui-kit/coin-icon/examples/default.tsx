import { CoinIcon } from "@bitcart/ui-kit/components"

const COINS = [
  { symbol: "btc" },
  { symbol: "ltc" },
  { symbol: "eth" },
  { symbol: "usdt", contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7", network: "eip155:1" },
  { symbol: "usdc", contract: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", network: "eip155:137" },
  { symbol: "usdt", contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", network: "tron:728126428" },
  { symbol: "usdt", contract: "0x0000000000000000000000000000000000000001", network: "eip155:1" },
  { symbol: "xrg" },
]

export const DefaultCoinIconExample: React.FC = () => (
  <div className="gap-3 flex items-center">
    {COINS.map((coin) => (
      <CoinIcon key={`${coin.symbol}:${coin.contract ?? ""}`} {...coin} />
    ))}
  </div>
)
