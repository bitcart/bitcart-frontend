import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, onTestFinished, test } from "vitest"

import { makeInvoice, makePayment } from "../fixtures"
import { installFakeTerminal } from "../terminal"
import { renderCheckout } from "../testing/render-checkout"
import { LightningNodeInfo } from "./lightning-node-info"

const NODE_ID = "03abc@203.0.113.7:9735"

const renderNodeInfo = (nodeId: string | null) =>
  renderCheckout({
    source: { invoice: makeInvoice({ payments: [makePayment({ node_id: nodeId })] }) },
    screens: { Payment: () => <LightningNodeInfo /> },
  })

describe("LightningNodeInfo", () => {
  test("reveals the node ID on request", () => {
    renderNodeInfo(NODE_ID)

    expect(screen.queryByText(NODE_ID)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Node info" }))

    expect(screen.getByRole("button", { name: "Copy Node ID" })).toHaveTextContent(NODE_ID)
  })

  test("shows nothing for a method without a node", () => {
    renderNodeInfo(null)

    expect(screen.queryByRole("button", { name: "Node info" })).not.toBeInTheDocument()
  })

  test("shows nothing on a terminal, where the buyer can't copy the node ID", () => {
    onTestFinished(installFakeTerminal())
    renderNodeInfo(NODE_ID)

    expect(screen.queryByRole("button", { name: "Node info" })).not.toBeInTheDocument()
  })
})
