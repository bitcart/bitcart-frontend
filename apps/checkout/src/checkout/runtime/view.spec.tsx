import { SOURCE_LOCALE_ID } from "@bitcart/core/i18n"
import { i18n, type Messages } from "@lingui/core"
import { t } from "@lingui/core/macro"
import { I18nProvider, useLingui } from "@lingui/react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { Suspense, type ComponentProps } from "react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { makeInvoice, makePayment, makeSource } from "../fixtures"
import { useCheckout } from "../hooks"
import { defineCheckoutTemplate, type CheckoutTemplateDefinition } from "../template"
import { createCheckoutControl } from "./control-store"
import { createTemplateRegistry } from "./registry"
import { CheckoutView } from "./view"

const templateModule = (definition: Omit<CheckoutTemplateDefinition, "name">) => () =>
  Promise.resolve({ default: defineCheckoutTemplate({ name: { id: "Test" }, ...definition }) })

const TestPayment = ({ templateName }: { templateName: string }) => {
  const { payment, selectMethod } = useCheckout("payment")

  return (
    <>
      <p>
        {templateName} pays {payment.name}
      </p>

      <button type="button" onClick={() => selectMethod("ltc")}>
        Pay with LTC
      </button>
    </>
  )
}

const registry = createTemplateRegistry(
  {
    "../templates/accordion/index.ts": templateModule({
      Payment: () => <TestPayment templateName="Accordion" />,
    }),

    "../templates/broken/index.ts": templateModule({
      Payment: () => {
        throw new Error("Broken template")
      },
    }),

    "../templates/spotlight/index.ts": templateModule({
      selection: "explicit",
      Payment: () => <TestPayment templateName="Spotlight" />,
    }),
  },
  { defaultId: "accordion" },
)

const makeTwoMethodSource = (invoiceId = "invoice-1") =>
  makeSource({
    invoice: makeInvoice({
      id: invoiceId,
      payments: [makePayment({ id: "btc", name: "BTC" }), makePayment({ id: "ltc", name: "LTC" })],
    }),
  })

const twoMethodSource = makeTwoMethodSource()

type ViewProps = Partial<ComponentProps<typeof CheckoutView>>

const viewElement = (props: ViewProps) => (
  <I18nProvider i18n={i18n}>
    <Suspense fallback={<p>Loading</p>}>
      <CheckoutView
        source={twoMethodSource}
        connection={null}
        registry={registry}
        templateId="accordion"
        {...props}
      />
    </Suspense>
  </I18nProvider>
)

//* An async act lets the lazily loaded template resolve before assertions run.
const renderViewWith = async (props: ViewProps) => {
  const rendered = await act(async () => {
    await Promise.resolve()

    return render(viewElement(props))
  })

  const rerender = (nextProps: ViewProps) =>
    act(async () => {
      await Promise.resolve()
      rendered.rerender(viewElement({ ...props, ...nextProps }))
    })

  return { ...rendered, rerender }
}

const renderView = (templateId: string, viewRegistry = registry) =>
  renderViewWith({ templateId, registry: viewRegistry })

describe("CheckoutView", () => {
  test("renders the requested template", async () => {
    await renderView("accordion")

    expect(await screen.findByText("Accordion pays BTC")).toBeInTheDocument()
  })

  test("applies the template's selection mode", async () => {
    await renderView("spotlight")

    expect(screen.getByText("Choose a payment method")).toBeInTheDocument()
  })

  test("falls back to the default template when the template crashes", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    await renderView("broken")

    expect(screen.getByText("Accordion pays BTC")).toBeInTheDocument()
  })
})

describe("CheckoutView state", () => {
  const payWithLtc = () => fireEvent.click(screen.getByRole("button", { name: "Pay with LTC" }))

  test("keeps the chosen method across a template switch", async () => {
    const { rerender } = await renderViewWith({ templateId: "accordion" })

    payWithLtc()
    await rerender({ templateId: "spotlight" })

    expect(await screen.findByText("Spotlight pays LTC")).toBeInTheDocument()
  })

  test("drops the chosen method for another invoice", async () => {
    const { rerender } = await renderViewWith({})

    payWithLtc()
    await rerender({ source: makeTwoMethodSource("invoice-2") })

    expect(screen.getByText("Accordion pays BTC")).toBeInTheDocument()
  })

  test("follows a control held by the host", async () => {
    const control = createCheckoutControl()

    await renderViewWith({ control })

    act(() => control.actions.selectMethod("ltc"))

    expect(screen.getByText("Accordion pays LTC")).toBeInTheDocument()
  })

  test("reports each new model to the host", async () => {
    const onModelChange = vi.fn()
    const { rerender } = await renderViewWith({ onModelChange })

    payWithLtc()
    await rerender({})

    expect(onModelChange.mock.calls).toMatchObject([
      [{ phase: "payment", selectedMethodId: "btc" }],
      [{ phase: "payment", selectedMethodId: "ltc" }],
    ])
  })
})

describe("CheckoutView translations", () => {
  const TranslatedPayment = () => <p>{t({ id: "test.pay", message: "Pay now" })}</p>

  const translatedRegistry = (catalogs: Record<string, () => Promise<{ messages: Messages }>>) =>
    createTemplateRegistry(
      { "../templates/accordion/index.ts": templateModule({ Payment: TranslatedPayment }) },
      { defaultId: "accordion", catalogs },
    )

  const catalogModule = (messages: Messages) => () => Promise.resolve({ messages })

  const activate = (locale: string) =>
    act(() => {
      i18n.loadAndActivate({ locale, messages: {} })
    })

  afterEach(() => {
    i18n.loadAndActivate({ locale: SOURCE_LOCALE_ID, messages: {} })
  })

  test("renders the template in the active locale once its catalog loads", async () => {
    const catalog = Promise.withResolvers<{ messages: Messages }>()

    activate("de")

    await renderView(
      "accordion",
      translatedRegistry({ "../templates/accordion/locales/de.po": () => catalog.promise }),
    )

    expect(screen.getByText("Loading")).toBeInTheDocument()
    expect(screen.queryByText("Pay now")).not.toBeInTheDocument()

    await act(async () => {
      catalog.resolve({ messages: { "test.pay": "Jetzt bezahlen" } })
      await catalog.promise
    })

    expect(await screen.findByText("Jetzt bezahlen")).toBeInTheDocument()
  })

  test("switches to a newly activated locale whose catalog is loaded, without a loading state", async () => {
    const viewRegistry = translatedRegistry({
      "../templates/accordion/locales/en.po": catalogModule({ "test.pay": "Pay now" }),
      "../templates/accordion/locales/fr.po": catalogModule({ "test.pay": "Payer" }),
    })

    await renderView("accordion", viewRegistry)
    expect(await screen.findByText("Pay now")).toBeInTheDocument()

    await viewRegistry.loadCatalog("accordion", "fr")

    act(() => {
      i18n.activate("fr")
    })

    expect(screen.queryByText("Loading")).not.toBeInTheDocument()
    expect(screen.getByText("Payer")).toBeInTheDocument()
  })

  test("renders the payment in the source locale when the catalog fails to load", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)

    const loadGerman = vi.fn(() =>
      Promise.reject(new Error("Failed to fetch dynamically imported module")),
    )

    //* Reads the message by id only, as production code does after the build strips its text.
    const StrippedPayment = () => <p>{useLingui().i18n._("test.pay")}</p>

    const viewRegistry = createTemplateRegistry(
      {
        "../templates/accordion/index.ts": templateModule({
          Payment: StrippedPayment,
          sourceMessages: { "test.pay": "Pay now" },
        }),
      },
      { defaultId: "accordion", catalogs: { "../templates/accordion/locales/de.po": loadGerman } },
    )

    activate("de")

    //* The route's preload fails first, then the render's own attempt.
    await expect(viewRegistry.loadCatalog("accordion", "de")).rejects.toThrow(/Failed to fetch/u)
    await renderView("accordion", viewRegistry)

    expect(await screen.findByText("Pay now")).toBeInTheDocument()
    expect(loadGerman).toHaveBeenCalledTimes(2)

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Checkout template "accordion"'),
      expect.any(Error),
    )
  })
})
