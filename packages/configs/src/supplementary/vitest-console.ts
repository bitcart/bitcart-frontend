import { format } from "node:util"

import { afterAll, afterEach } from "vitest"

const GUARDED_CONSOLE_METHODS = ["error", "warn"] as const

export type ConsoleOutputGuardOptions = {
  allowed?: ((message: string) => boolean)[]
}

export const failOnUnexpectedConsoleOutput = ({ allowed = [] }: ConsoleOutputGuardOptions = {}) => {
  const unexpectedOutput: string[] = []

  for (const method of GUARDED_CONSOLE_METHODS) {
    console[method] = (...args: unknown[]) => {
      const message = format(...args)

      if (!allowed.some((isAllowed) => isAllowed(message))) {
        unexpectedOutput.push(`console.${method}: ${message}`)
      }
    }
  }

  const assertNoUnexpectedOutput = () => {
    if (unexpectedOutput.length > 0) {
      throw new Error(
        `Unexpected console output. Fix its cause, or spy on the console method in a test that expects it:\n\n${unexpectedOutput.splice(0).join("\n\n")}`,
      )
    }
  }

  afterEach(assertNoUnexpectedOutput)
  afterAll(assertNoUnexpectedOutput)
}
