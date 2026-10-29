declare global {
  interface Window {
    Bitcart?: {
      open: (invoiceId: string) => unknown
    }
  }
}

export {}
