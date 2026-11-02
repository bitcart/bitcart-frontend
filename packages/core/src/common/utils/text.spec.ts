import { describe, expect, test } from "vitest"

import { getInitials } from "./text"

describe("getInitials", () => {
  test.each([
    ["Ada Lovelace", "AL"],
    ["Grace Brewster Murray Hopper", "GH"],
    ["MrNaif2018", "MN"],
    ["alice", "A"],
    ["  émile zola ", "ÉZ"],
    ["", ""],
  ])("%j → %j", (name, initials) => {
    expect(getInitials(name)).toBe(initials)
  })
})
