export type ImageSources = {
  src: string
  srcSet?: string
  sizes?: string
}

export const preloadImage = (
  { src, srcSet, sizes }: ImageSources,
  { timeoutMs }: { timeoutMs: number },
): Promise<void> => {
  if (typeof Image === "undefined") return Promise.resolve()

  const image = new Image()
  let timeout: ReturnType<typeof setTimeout> | undefined

  if (sizes) image.sizes = sizes
  if (srcSet) image.srcset = srcSet

  image.src = src

  return Promise.race([
    image.decode().catch(() => undefined),
    new Promise<void>((resolve) => {
      timeout = setTimeout(resolve, timeoutMs)
    }),
  ]).finally(() => clearTimeout(timeout))
}
