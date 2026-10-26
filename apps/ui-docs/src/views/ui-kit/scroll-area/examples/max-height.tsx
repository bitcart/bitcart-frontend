import { ScrollArea } from "@bitcart/ui-kit/components"

const transactions = (count: number) =>
  Array.from({ length: count }, (_value, index) => ({
    id: `tx-${index + 1}`,
    hash: `bc1q…${(index + 1).toString().padStart(4, "0")}`,
    amount: `${(0.01 * (index + 1)).toFixed(2)} BTC`,
  }))

const TransactionList = ({ count }: { count: number }) => (
  <ScrollArea className="border-border rounded-md max-h-64 w-72 border">
    <ul className="p-4 gap-2 text-sm flex flex-col">
      {transactions(count).map(({ id, hash, amount }) => (
        <li key={id} className="flex items-center justify-between">
          <span className="font-mono">{hash}</span>

          <span className="text-muted-foreground">{amount}</span>
        </li>
      ))}
    </ul>
  </ScrollArea>
)

export const MaxHeightScrollAreaExample: React.FC = () => (
  <div className="gap-4 flex flex-wrap items-start">
    <TransactionList count={3} />
    <TransactionList count={16} />
  </div>
)
