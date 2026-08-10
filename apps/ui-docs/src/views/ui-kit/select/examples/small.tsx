import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
        <SelectLabel>Native</SelectLabel>

        {CURRENCIES.filter(({ group }) => group === "Native").map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectGroup>

      <SelectSeparator />

      <SelectGroup>
        <SelectLabel>Tokens</SelectLabel>

        {CURRENCIES.filter(({ group }) => group === "Tokens").map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
)
