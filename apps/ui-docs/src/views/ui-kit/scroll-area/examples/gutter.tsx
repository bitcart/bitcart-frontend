import { ScrollArea } from "@bitcart/ui-kit/components"

const TRANSACTIONS = Array.from({ length: 16 }, (_value, index) => ({
  id: `tx-${index + 1}`,
  hash: `bc1q…${(index + 1).toString().padStart(4, "0")}`,
  amount: `${(0.01 * (index + 1)).toFixed(2)} BTC`,
}))

export const GutterScrollAreaExample: React.FC = () => (
  <ScrollArea scrollbarGutter className="border-border rounded-md h-64 w-72 border">
    <ul className="p-4 gap-2 text-sm flex flex-col">
      {TRANSACTIONS.map(({ id, hash, amount }) => (
        <li key={id} className="flex items-center justify-between">
          <span className="font-mono">{hash}</span>

          <span className="text-muted-foreground">{amount}</span>
        </li>
      ))}
    </ul>
  </ScrollArea>
)
