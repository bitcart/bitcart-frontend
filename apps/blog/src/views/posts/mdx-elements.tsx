import { isHttpHref, isInternalHref, type HttpHref } from "@bitcart/core/navigation"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
  Figure as FigureFrame,
  FigureCaption,
  FigureGallery,
  FigureImage,
  FigureSource,
  FigureVideo,
  FigureVideoEmbed,
  HeadingAnchor,
} from "@bitcart/ui-kit/components"
import { useLayoutContext } from "@bitcart/ui-kit/hooks"
import { getTargetBlankA11yHint } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { useRef } from "react"

import { getMediaUrl, getResponsiveImage } from "#/common/content/media"

type FigureMedia = { src: string; alt: string }

type FigureCaptionProps = {
  caption?: string
  source?: HttpHref
}

//* The prose column is `max-w-3xl` (48rem) wide, inset by 1rem gutters on phones, and a gallery
//* shows two images per row, 0.75rem apart.
const PROSE_IMAGE_SIZES = "(min-width: 48rem) 48rem, calc(100vw - 2rem)"
const GALLERY_IMAGE_SIZES = "(min-width: 48rem) 24rem, calc((100vw - 2.75rem) / 2)"

const Caption: React.FC<FigureCaptionProps> = ({ caption, source }) =>
  caption || source ? (
    <FigureCaption>
      {caption}
      {caption && source && " "}
      {source && <FigureSource href={source}>Telegram</FigureSource>}
    </FigureCaption>
  ) : null

export const Figure: React.FC<FigureMedia & FigureCaptionProps> = ({
  src,
  alt,
  ...captionProps
}) => (
  <FigureFrame>
    <FigureImage {...getResponsiveImage(src)} sizes={PROSE_IMAGE_SIZES} alt={alt} />
    <Caption {...captionProps} />
  </FigureFrame>
)

export const Gallery: React.FC<{ images: FigureMedia[] } & FigureCaptionProps> = ({
  images,
  ...captionProps
}) => (
  <FigureFrame>
    <FigureGallery>
      {images.map((image) => (
        <FigureImage
          key={image.src}
          {...getResponsiveImage(image.src)}
          sizes={GALLERY_IMAGE_SIZES}
          alt={image.alt}
        />
      ))}
    </FigureGallery>

    <Caption {...captionProps} />
  </FigureFrame>
)

export const VideoFigure: React.FC<{ src: string; poster: string } & FigureCaptionProps> = ({
  src,
  poster,
  ...captionProps
}) => {
  const { src: posterSrc, width, height } = getResponsiveImage(poster)

  return (
    <FigureFrame>
      <FigureVideo
        src={getMediaUrl(src)}
        poster={posterSrc}
        width={width}
        height={height}
        muted
        playsInline
      />

      <Caption {...captionProps} />
    </FigureFrame>
  )
}

export const YouTubeFigure: React.FC<{
  videoId: string
  poster: string
  title: string
  caption?: string
}> = ({ videoId, poster, title, caption }) => (
  <FigureFrame>
    <FigureVideoEmbed
      src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
      poster={getResponsiveImage(poster).src}
      title={title}
    />

    <FigureCaption>
      {caption && `${caption} `}
      <FigureSource href={`https://www.youtube.com/watch?v=${videoId}`}>YouTube</FigureSource>
    </FigureCaption>
  </FigureFrame>
)

type ProseHeadingProps = React.ComponentProps<"h2"> & { as: "h2" | "h3" }

const ProseHeading: React.FC<ProseHeadingProps> = ({ as: Heading, id, children, ...props }) => (
  <Heading id={id} {...props}>
    {id ? <HeadingAnchor href={`#${id}`}>{children}</HeadingAnchor> : children}
  </Heading>
)

export const H2: React.FC<React.ComponentProps<"h2">> = (props) => (
  <ProseHeading as="h2" {...props} />
)

export const H3: React.FC<React.ComponentProps<"h3">> = (props) => (
  <ProseHeading as="h3" {...props} />
)

export const Pre: React.FC<React.ComponentProps<"pre"> & { "data-language"?: string }> = ({
  "data-language": language,
  ...props
}) => {
  const contentRef = useRef<HTMLPreElement>(null)

  return (
    <CodeBlock className="my-6 not-prose">
      <CodeBlockHeader>
        <CodeBlockTitle>{language}</CodeBlockTitle>

        <CodeBlockActions>
          <CodeBlockCopyButton value={() => contentRef.current?.textContent ?? ""} />
        </CodeBlockActions>
      </CodeBlockHeader>

      <CodeBlockContent ref={contentRef} {...props} />
    </CodeBlock>
  )
}

export const ProseLink: React.FC<React.ComponentProps<"a">> = ({ href = "", title, children }) => {
  const { Link } = useLayoutContext()
  const { i18n } = useLingui()

  if (isHttpHref(href)) {
    return (
      <Link href={href} title={title} a11yHint={getTargetBlankA11yHint(i18n)}>
        {children}
      </Link>
    )
  } else if (isInternalHref(href) && !href.startsWith("#")) {
    return (
      <Link href={href} title={title}>
        {children}
      </Link>
    )
  } else {
    //* In-page links stay plain anchors too: the router would mark them as the current page.
    return (
      <a href={href} title={title}>
        {children}
      </a>
    )
  }
}
