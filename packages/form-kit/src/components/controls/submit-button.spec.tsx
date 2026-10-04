import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { i18n } from "@lingui/core"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest"
import * as z from "zod"

import { useAppForm } from "@/hooks"

const contactSchema = z.object({ name: z.string().min(1), city: z.string().min(1) })

const ContactForm = ({
  onSubmit,
  validatesOnChange = false,
}: {
  onSubmit: () => Promise<void>
  validatesOnChange?: boolean
}) => {
  const form = useAppForm({
    defaultValues: { name: "", city: "" },

    validators: validatesOnChange
      ? { onSubmit: contactSchema, onChange: contactSchema }
      : { onSubmit: contactSchema },

    onSubmit,
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.AppField name="name">
        {(field) => <field.TextField type="text" label="Name" />}
      </form.AppField>

      <form.AppField name="city">
        {(field) => <field.TextField type="text" label="City" />}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton label="Save" />
      </form.AppForm>
    </form>
  )
}

const fill = (label: string, value: string) =>
  fireEvent.change(screen.getByRole("textbox", { name: label }), { target: { value } })

const submit = () =>
  act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    await Promise.resolve()
  })

beforeAll(() => {
  i18n.loadAndActivate({ locale: SOURCE_LOCALE_ID, messages: {} })
})

afterEach(() => {
  cleanup()
})

describe("SubmitButton", () => {
  test("submits an untouched form so validation can flag its required fields", async () => {
    const onSubmit = vi.fn(() => Promise.resolve())
    render(<ContactForm onSubmit={onSubmit} />)

    await submit()

    expect(screen.getByRole("textbox", { name: "Name" }).getAttribute("aria-invalid")).toBe("true")
    expect(screen.getByRole("textbox", { name: "City" }).getAttribute("aria-invalid")).toBe("true")
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test("moves focus to the first invalid field after a rejected submit", async () => {
    render(<ContactForm onSubmit={() => Promise.resolve()} />)

    await submit()

    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Name" }))

    fill("Name", "Alice")
    await submit()

    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "City" }))
  })

  test("moves focus when a form invalid on change rejects the submit up front", async () => {
    const onSubmit = vi.fn(() => Promise.resolve())
    render(<ContactForm onSubmit={onSubmit} validatesOnChange />)

    fill("Name", "Alice")
    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "City" }))
  })

  test("leaves focus alone when the form submits", async () => {
    const onSubmit = vi.fn(() => Promise.resolve())
    render(<ContactForm onSubmit={onSubmit} />)

    fill("Name", "Alice")
    fill("City", "Berlin")
    screen.getByRole("button", { name: "Save" }).focus()
    await submit()

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Save" }))
  })

  test("blocks resubmission and shows progress while the form submits", async () => {
    const submission = Promise.withResolvers<void>()
    render(<ContactForm onSubmit={() => submission.promise} />)

    fill("Name", "Alice")
    fill("City", "Berlin")
    await submit()

    expect(screen.getByRole("button", { name: /Save/u }).hasAttribute("disabled")).toBe(true)
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy()

    await act(async () => {
      submission.resolve()
      await submission.promise
    })

    expect(screen.getByRole("button", { name: /Save/u }).hasAttribute("disabled")).toBe(false)
    expect(screen.queryByRole("status", { name: "Loading" })).toBeNull()
  })
})
