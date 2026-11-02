import {
  Figure,
  FigureCaption,
  FigureGallery,
  FigureImage,
  FigureSource,
} from "@bitcart/ui-kit/components"

export const GalleryFigureExample: React.FC = () => (
  <Figure className="max-w-xl">
    <FigureGallery>
      <FigureImage src="/examples/landing-coins.jpg" alt="Supported coins and token counts" />
      <FigureImage src="/examples/landing-support.jpg" alt="Reasons to support Bitcart" />
    </FigureGallery>

    <FigureCaption>
      Two sections of the Bitcart website.{" "}
      <FigureSource href="https://bitcart.ai">bitcart.ai</FigureSource>
    </FigureCaption>
  </Figure>
)
