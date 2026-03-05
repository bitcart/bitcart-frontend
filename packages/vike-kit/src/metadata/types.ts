export interface StaticLayoutMetadata {
  author: string
  title: string
  description: string

  image: {
    src: string
    alt: string
    width: string
    height: string
    secureUrl?: string
  }
}

export interface LayoutMetadata extends StaticLayoutMetadata {
  locale: string
  url: string
  baseUrl: string
}
