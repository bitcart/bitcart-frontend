import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "@bitcart/ui-kit/components"

const CURRENCIES = [
  "Bitcoin (BTC)",
  "Lightning (BTC)",
  "Ethereum (ETH)",
  "Litecoin (LTC)",
  "Monero (XMR)",
  "Tether (USDT)",
]

export const DefaultAutocompleteExample: React.FC = () => (
  <Autocomplete items={CURRENCIES}>
    <AutocompleteInput className="w-72" placeholder="Search currencies…" />

    <AutocompletePopup>
      <AutocompleteEmpty>No currencies found.</AutocompleteEmpty>

      <AutocompleteList>
        {(currency: string) => (
          <AutocompleteItem key={currency} value={currency}>
            {currency}
          </AutocompleteItem>
        )}
      </AutocompleteList>
    </AutocompletePopup>
  </Autocomplete>
)
