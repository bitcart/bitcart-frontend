declare global {
  interface Window {
    // Global type definitions for Bitcart modal
    bitcart?: {
      showInvoice: (invoiceId: string) => void
    }
  }
}

export {}
