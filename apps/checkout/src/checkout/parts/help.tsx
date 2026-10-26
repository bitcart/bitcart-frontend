import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  ResponsiveDialog,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogPanel,
  ResponsiveDialogPopup,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { Trans, useLingui } from "@lingui/react/macro"
import { CircleHelpIcon } from "lucide-react"

import { getHelpLead, getHelpTopics } from "../help"
import { useCheckout } from "../hooks"
import type { CheckoutStoreSupport } from "../model"
import { ExternalLink } from "./external-link"

const StoreContact = ({
  support,
  children,
}: {
  support: CheckoutStoreSupport | null
  children?: React.ReactNode
}) =>
  support ? (
    <ExternalLink
      href={support.href}
      newTab={support.kind === "url"}
      className="font-medium text-foreground"
      linkClassName="underline underline-offset-2 hover:text-primary"
    >
      {children}
    </ExternalLink>
  ) : (
    <span className="font-medium text-foreground">{children}</span>
  )

const HelpContact = ({ className }: { className?: string }) => {
  const { store, invoice } = useCheckout()
  const storeName = store.name
  const invoiceId = invoice.id

  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      <Trans>
        Still stuck? <StoreContact support={store.support}>Contact {storeName}</StoreContact> and
        mention invoice <span className="font-mono break-all">{invoiceId}</span>.
      </Trans>
    </p>
  )
}

const HelpTopics = () => {
  const { i18n } = useLingui()
  const model = useCheckout()
  const { topic: lead, isContactFirst } = getHelpLead(model)

  const topics = getHelpTopics(i18n, model.store.name)
    .filter(({ id, isLeadOnly }) => !isLeadOnly || id === lead)
    .sort((a, b) => Number(b.id === lead) - Number(a.id === lead))

  return (
    <>
      {isContactFirst && <HelpContact className="mb-6" />}

      <Accordion variant="divided" defaultValue={lead ? [lead] : []}>
        {topics.map(({ id, question, answer }) => (
          <AccordionItem key={id} value={id}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {!isContactFirst && <HelpContact className="mt-6" />}
    </>
  )
}

type CheckoutHelpProps = {
  trigger?: React.ReactElement
  children?: React.ReactNode
}

export const CheckoutHelp = ({ trigger, children }: CheckoutHelpProps) => {
  const { t } = useLingui()
  const { environment } = useCheckout()

  if (environment.terminal) {
    return null
  } else
    return (
      <ResponsiveDialog>
        <ResponsiveDialogTrigger
          render={trigger ?? <Button variant="ghost" size="icon-lg" aria-label={t`Help`} />}
        >
          {children ?? <CircleHelpIcon />}
        </ResponsiveDialogTrigger>

        <ResponsiveDialogPopup>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{t`Help with this payment`}</ResponsiveDialogTitle>

            <ResponsiveDialogDescription>
              {t`Where people most often get stuck, and what to do.`}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <ResponsiveDialogPanel>
            <HelpTopics />
          </ResponsiveDialogPanel>
        </ResponsiveDialogPopup>
      </ResponsiveDialog>
    )
}
