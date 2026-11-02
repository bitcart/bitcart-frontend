type ImageVariant = {
  src: string
  width: number
  height: number
}

type ImageSize = {
  width: number
  height: number
}

export type ResponsiveImage = {
  src: string
  srcSet: string
  width: number
  height: number
}

//* vite-imagetools never upscales: widths past an image's own all return its original width.
const IMAGE_VARIANTS = import.meta.glob<ImageVariant | ImageVariant[]>(
  "/content/media/**/*.{png,jpg,jpeg,webp}",
  {
    query: { w: "480;960;1440", format: "webp", as: "metadata:src;width;height" },
    import: "default",
    eager: true,
  },
)

const IMAGE_SIZES = import.meta.glob<ImageSize>("/content/media/**/*.{png,jpg,jpeg,webp}", {
  query: { as: "metadata:width;height" },
  import: "default",
  eager: true,
})

const FILE_URLS = import.meta.glob<string>("/content/media/**/*", {
  query: "?url",
  import: "default",
  eager: true,
})

const toGlobKey = (path: string) => `/content${path}`

export const getMediaUrl = (path: string): string => {
  const url = FILE_URLS[toGlobKey(path)]

  if (url) {
    return url
  } else throw new Error(`No media file at ${path}`)
}

export const getResponsiveImage = (path: string): ResponsiveImage => {
  const variants = IMAGE_VARIANTS[toGlobKey(path)]

  if (variants) {
    const uniqueVariants = [
      ...new Map([variants].flat().map((variant) => [variant.width, variant])).values(),
    ].toSorted((a, b) => a.width - b.width)

    const largest = uniqueVariants[uniqueVariants.length - 1]

    return {
      src: largest.src,
      srcSet: uniqueVariants.map(({ src, width }) => `${src} ${width}w`).join(", "),
      width: largest.width,
      height: largest.height,
    }
  } else throw new Error(`No image at ${path}`)
}

export const getImageSize = (path: string): ImageSize => {
  const size = IMAGE_SIZES[toGlobKey(path)]

  if (size) {
    return size
  } else throw new Error(`No image at ${path}`)
}
