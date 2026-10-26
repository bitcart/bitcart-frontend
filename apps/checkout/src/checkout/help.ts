import type { I18n } from "@lingui/core"
import { msg } from "@lingui/core/macro"

import type { CheckoutModel } from "./model"

export type CheckoutHelpTopicId =
  | "partial"
  | "credited"
  | "pending"
  | "who"
  | "network"
  | "expired"
  | "exchange"

type CheckoutHelpTopic = {
  id: CheckoutHelpTopicId
  question: string
  answer: string

  isLeadOnly?: boolean
}

export const getHelpTopics = (i18n: I18n, store: string): CheckoutHelpTopic[] => [
  {
    id: "partial",
    isLeadOnly: true,
    question: i18n.t(msg`I sent less than the full amount`),

    answer: i18n.t(
      msg`Send the rest before the timer runs out, in the same coin, on the same network and from the same wallet. Send exactly the amount still due shown on this page, and check it in your wallet before you confirm. If time runs out first, contact ${store} about what you already sent.`,
    ),
  },

  {
    id: "credited",
    isLeadOnly: true,
    question: i18n.t(msg`${store} hasn't credited my payment`),

    answer: i18n.t(
      msg`This page shows that ${store} received your payment. Crediting your order or account is up to ${store}, so contact them and mention the invoice ID below.`,
    ),
  },

  {
    id: "pending",
    question: i18n.t(msg`I paid, but nothing has happened yet`),

    answer: i18n.t(
      msg`This page updates by itself once it detects your payment, which for some coins happens only when the payment is in a block. Then it waits for the confirmations ${store} requires. Don't send it again. If the timer runs out and the page still shows no payment, contact ${store} with your transaction ID.`,
    ),
  },

  {
    id: "who",
    question: i18n.t(msg`Did I pay Bitcart?`),

    answer: i18n.t(
      msg`No, you pay ${store}. Bitcart is the software ${store} runs its checkout on, not a payment company: Bitcart doesn't receive your payment and can't see it or your account with ${store}. For anything about this payment, contact ${store}.`,
    ),
  },

  {
    id: "network",
    question: i18n.t(msg`I used the wrong coin or network`),

    answer: i18n.t(
      msg`A payment in another coin or on another network doesn't count toward this invoice, even if it went to the same address. Contact ${store} with your transaction ID: only they can check whether it can be recovered.`,
    ),
  },

  {
    id: "expired",
    question: i18n.t(msg`What happens when the timer runs out?`),

    answer: i18n.t(
      msg`Your payment has to be detected before the timer ends. After that the invoice expires, its price is no longer held, and a payment sent later isn't matched to it: contact ${store} with your transaction ID. To pay, ask ${store} for a new invoice.`,
    ),
  },

  {
    id: "exchange",
    question: i18n.t(msg`Can I pay from an exchange account?`),

    answer: i18n.t(
      msg`Paying from a wallet you control is safer. Exchanges often delay withdrawals or take their fee out of the amount, so less arrives than the invoice asks for. Make sure the full amount arrives.`,
    ),
  },
]

export type CheckoutHelpLead = {
  topic: CheckoutHelpTopicId | null

  isContactFirst: boolean
}

export const getHelpLead = (model: CheckoutModel): CheckoutHelpLead => {
  const refundStatus = model.phase === "status" ? model.receipt?.refund?.status : undefined

  if (model.phase === "payment" && model.payment.partial) {
    return { topic: "partial", isContactFirst: false }
  } else if (model.phase === "confirming") {
    return { topic: "pending", isContactFirst: false }
  } else if (model.phase === "status" && model.status === "expired") {
    return { topic: "expired", isContactFirst: false }
  } else if (refundStatus === "unclaimed") {
    return { topic: null, isContactFirst: false }
  } else if (refundStatus === "pending" || refundStatus === "failed") {
    return { topic: null, isContactFirst: true }
  } else if (model.phase === "status" && model.status === "complete" && !model.exception) {
    return { topic: "credited", isContactFirst: false }
  } else if (model.phase === "status" || model.phase === "unavailable") {
    return { topic: null, isContactFirst: true }
  } else return { topic: null, isContactFirst: false }
}
