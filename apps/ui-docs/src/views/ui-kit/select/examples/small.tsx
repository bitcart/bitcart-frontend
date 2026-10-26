import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@bitcart/ui-kit/components"

const CURRENCIES = [
  { value: "btc", label: "Bitcoin", group: "Native" },
  { value: "ltc", label: "Litecoin", group: "Native" },
  { value: "xmr", label: "Monero", group: "Native" },
  { value: "usdt", label: "Tether", group: "Tokens" },
  { value: "usdc", label: "USD Coin", group: "Tokens" },
]

export const SmallSelectExample: React.FC = () => (
  <Select items={CURRENCIES}>
    <SelectTrigger className="w-56" size="sm">
      <SelectValue placeholder="Select a currency" />
    </SelectTrigger>

    <SelectContent>
      <SelectGroup>
        <SelectGroupLabel>Native</SelectGroupLabel>

        {CURRENCIES.filter(({ group }) => group === "Native").map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectGroup>

      <SelectSeparator />

      <SelectGroup>
        <SelectGroupLabel>Tokens</SelectGroupLabel>

        {CURRENCIES.filter(({ group }) => group === "Tokens").map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
)
