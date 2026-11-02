import { Figure, FigureCaption, FigureImage, FigureSource } from "@bitcart/ui-kit/components"

export const ImageFigureExample: React.FC = () => (
  <Figure className="max-w-xl">
    <FigureImage src="/examples/landing-features.jpg" alt="Feature cards on the Bitcart website" />

    <FigureCaption>
      What Bitcart offers, at a glance.{" "}
      <FigureSource href="https://bitcart.ai">bitcart.ai</FigureSource>
    </FigureCaption>
  </Figure>
)
