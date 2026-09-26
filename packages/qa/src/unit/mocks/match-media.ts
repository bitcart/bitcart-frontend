/**
 * Mocks `window.matchMedia`, which jsdom does not implement.
 *
 * @example
 * mockMatchMedia()
 * // Then window.matchMedia("(prefers-color-scheme: dark)").matches === false
 */
export const mockMatchMedia = (): void => {
  const noop = () => undefined

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,

    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
      dispatchEvent: () => false,
    }),
  })
}
