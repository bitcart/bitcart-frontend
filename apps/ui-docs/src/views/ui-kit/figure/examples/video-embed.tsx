import { Figure, FigureCaption, FigureSource, FigureVideoEmbed } from "@bitcart/ui-kit/components"

export const VideoEmbedFigureExample: React.FC = () => (
  <Figure className="max-w-xl">
    <FigureVideoEmbed
      src="https://www.youtube-nocookie.com/embed/lUNSbC8NzgQ?autoplay=1"
      poster="/examples/whmcs-plugin-video.jpg"
      title="BitcartCC WHMCS plugin is out!"
    />

    <FigureCaption>
      Paying a WHMCS invoice with Bitcart.{" "}
      <FigureSource href="https://www.youtube.com/watch?v=lUNSbC8NzgQ">YouTube</FigureSource>
    </FigureCaption>
  </Figure>
)
