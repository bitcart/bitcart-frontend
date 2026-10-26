import { waitUntilHydrated } from "@bitcart/qa/e2e"
import { expect, test, type Page } from "@playwright/test"

const toolbar = (page: Page) => page.getByRole("region", { name: "Preview options" })

test.describe("Checkout: Preview options", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/preview/flow?status=new")
    await waitUntilHydrated(page)
  })

  test("steps through the statuses", async ({ page }) => {
    await expect(toolbar(page).getByRole("button", { name: "Previous status" })).toBeDisabled()

    await toolbar(page).getByRole("button", { name: "Next status" }).click()

    await expect(page).toHaveURL(/status=details/)
  })

  test("sets every invoice axis from a preset", async ({ page }) => {
    await toolbar(page).getByRole("combobox", { name: "Preset" }).click()
    await page.getByRole("option", { name: "partial-split-discount", exact: true }).click()

    await expect(page).toHaveURL(/received=partial-2/)
    await expect(page).toHaveURL(/fee=true/)
    await expect(page).toHaveURL(/discount=true/)

    await expect(toolbar(page).getByRole("combobox", { name: "Preset" })).toHaveText(
      "partial-split-discount",
    )
  })

  test("offers only the received amounts the status allows", async ({ page }) => {
    await toolbar(page).getByRole("combobox", { name: "Received" }).click()

    await expect(page.getByRole("option")).toHaveText(["none", "partial", "partial-2"])
  })

  test("picks a status from the grouped list", async ({ page }) => {
    await toolbar(page).getByRole("combobox", { name: "Status" }).click()

    const list = page.getByRole("listbox")

    await expect(list.getByRole("group", { name: "Final" })).toBeVisible()
    await list.getByRole("option", { name: "refunded", exact: true }).click()

    await expect(page).toHaveURL(/status=refunded/)
  })

  test("switches the environment and back to the default", async ({ page }) => {
    const environment = toolbar(page).getByRole("combobox", { name: "Environment" })

    await environment.click()
    await page.getByRole("option", { name: "terminal", exact: true }).click()
    await expect(page).toHaveURL(/environment=terminal/)

    await environment.click()
    await page.getByRole("option", { name: "browser", exact: true }).click()
    await expect(page).not.toHaveURL(/environment=/)
  })

  test("switches between the checkout and the receipt", async ({ page }) => {
    const receipt = toolbar(page).getByRole("button", { name: "receipt" })

    await receipt.click()

    await expect(page).toHaveURL(/view=receipt/)
    await expect(receipt).toHaveAttribute("aria-pressed", "true")
  })
})
