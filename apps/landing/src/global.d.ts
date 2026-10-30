declare global {
  interface Window {
    Bitcart?: {
      open: (invoiceId: string) => HTMLElement
    }
  }
}

export {}
