import { Figure, FigureCaption, FigureVideo } from "@bitcart/ui-kit/components"

export const VideoFigureExample: React.FC = () => (
  <Figure className="max-w-xl">
    <FigureVideo src="/examples/landing-scroll.mp4" poster="/examples/landing-scroll.jpg" muted />
    <FigureCaption>Scrolling through the feature cards on the Bitcart website.</FigureCaption>
  </Figure>
)
