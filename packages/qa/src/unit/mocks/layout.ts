const noop = () => undefined

class ResizeObserverMock implements ResizeObserver {
  observe = noop
  unobserve = noop
  disconnect = noop
}

const emptyRectList = (): DOMRectList =>
  Object.assign([], { item: () => null }) as unknown as DOMRectList

/**
 * Mocks the layout APIs jsdom does not implement: `ResizeObserver`, `Element.getAnimations`,
 * `Element.animate`, `Range.getClientRects` and `document.fonts`. Libraries that find a
 * `ResizeObserver` also inspect animations, and code that measures text lines waits for fonts first.
 *
 * @example
 * mockLayoutApis()
 */
export const mockLayoutApis = (): void => {
  globalThis.ResizeObserver = ResizeObserverMock
  Element.prototype.getAnimations = () => []
  Element.prototype.animate = () => ({ cancel: noop }) as unknown as Animation
  Range.prototype.getClientRects = emptyRectList

  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: { ready: Promise.resolve() },
  })
}
