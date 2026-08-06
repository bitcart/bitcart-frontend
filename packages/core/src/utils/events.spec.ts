import { userEvent } from "@testing-library/user-event"
import { expect, test, describe, beforeAll, beforeEach } from "vitest"

import { isLmbClick } from "./events"

describe("isLmbClick", () => {
  const user = userEvent.setup()
  const button = document.createElement("button")
  let lastButtonEvent: null | PointerEvent = null

  beforeAll(() => {
    button.addEventListener("click", (e) => {
      lastButtonEvent = e
    })
  })

  beforeEach(() => {
    lastButtonEvent = null
  })

  test("returns true for a left mouse button click without modifiers", async () => {
    await user.click(button)

    expect(lastButtonEvent).toBeTruthy()
    expect(isLmbClick(lastButtonEvent as unknown as PointerEvent)).toBe(true)
  })

  test.each(["Alt", "Control", "Shift", "Meta"] as const)(
    "returns false for a left mouse button click with %s modifier",

    async (modifier) => {
      await user.keyboard(`{${modifier}>}`)
      await user.click(button)
      await user.keyboard(`{/${modifier}}`)

      expect(lastButtonEvent).toBeTruthy()
      expect(isLmbClick(lastButtonEvent as unknown as PointerEvent)).toBe(false)
    },
  )
})
