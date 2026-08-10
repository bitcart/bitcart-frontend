import { Card } from "@fumadocs/base-ui/components/card"

export type VariantGalleryProps = {
  children: React.ReactNode
}

export const VariantGalleryRoot: React.FC<VariantGalleryProps> = ({ children }) => {
  return <section className="gap-4 pt-4 flex flex-col"> {children}</section>
}

export type VariantGalleryItemProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export const VariantGalleryItem: React.FC<VariantGalleryItemProps> = ({ children, ...props }) => (
  <Card {...props}>
    <div className="gap-4 p-8 flex flex-col items-center">{children}</div>
  </Card>
)
