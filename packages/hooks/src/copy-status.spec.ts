import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { useCopyStatus } from "./copy-status"

const writeText = vi.fn<(value: string) => Promise<void>>()
const execCommand = vi.fn<(command: string) => boolean>()

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal("navigator", { clipboard: { writeText } })
  document.execCommand = execCommand
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const copyAddress = async () => {
  const { result } = renderHook(() => useCopyStatus<"address">())

  await act(async () => {
    result.current.copy("address", "bc1q")
    await vi.advanceTimersByTimeAsync(0)
  })

  return result
}

describe("useCopyStatus", () => {
  test("reports a copy through the Clipboard API", async () => {
    writeText.mockResolvedValue()

    const result = await copyAddress()

    expect(writeText).toHaveBeenCalledWith("bc1q")
    expect(result.current.status).toEqual({ key: "address", outcome: "copied" })
  })

  test("falls back to copying a selection when the Clipboard API refuses", async () => {
    writeText.mockRejectedValue(new Error("denied"))
    execCommand.mockReturnValue(true)

    const result = await copyAddress()

    expect(execCommand).toHaveBeenCalledWith("copy")
    expect(result.current.status).toEqual({ key: "address", outcome: "copied" })
  })

  test("gives focus back to the pressed control after copying a selection", async () => {
    writeText.mockRejectedValue(new Error("denied"))
    execCommand.mockReturnValue(true)

    const button = document.createElement("button")

    document.body.append(button)
    button.focus()

    await copyAddress()

    expect(document.activeElement).toBe(button)
    button.remove()
  })

  test("reports a failure when both ways fail", async () => {
    writeText.mockRejectedValue(new Error("denied"))
    execCommand.mockReturnValue(false)

    const result = await copyAddress()

    expect(result.current.status).toEqual({ key: "address", outcome: "failed" })
  })

  test("clears the outcome after two seconds", async () => {
    writeText.mockResolvedValue()

    const result = await copyAddress()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })

    expect(result.current.status).toBeNull()
  })
})
