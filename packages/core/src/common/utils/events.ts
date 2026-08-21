export type LmbClickEventLike = {
  defaultPrevented: boolean
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
}

/**
 * Determines if a click event is a left-mouse button click without modifiers.
 */
export const isLmbClick = (event: LmbClickEventLike): boolean =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey
