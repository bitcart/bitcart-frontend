import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@bitcart/ui-kit/components"

const NETWORKS = [
  { value: "mainnet", label: "Mainnet" },
  { value: "testnet", label: "Testnet" },
  { value: "regtest", label: "Regtest" },
]

export const LabelledSelectExample: React.FC = () => (
  <Select items={NETWORKS} defaultValue="mainnet">
    <div className="gap-2 flex flex-col">
      <SelectLabel>Network</SelectLabel>

      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
    </div>

    <SelectContent>
      {NETWORKS.map(({ value, label }) => (
        <SelectItem key={value} value={value}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)
