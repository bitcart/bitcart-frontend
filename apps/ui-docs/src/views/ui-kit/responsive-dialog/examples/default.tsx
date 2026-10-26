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

const QUESTIONS = [
  {
    question: "I paid, but nothing has happened yet",
    answer:
      "The page updates by itself once it detects your payment, then waits for the confirmations the store requires.",
  },

  {
    question: "I used the wrong coin or network",
    answer:
      "A payment in another coin or on another network doesn't count toward this invoice. Contact the store with your transaction ID.",
  },

  {
    question: "Can I pay from an exchange account?",
    answer:
      "Exchanges often take their fee out of the amount, so less arrives than the invoice asks for.",
  },
]

export const DefaultResponsiveDialogExample: React.FC = () => (
  <ResponsiveDialog>
    <ResponsiveDialogTrigger render={<Button variant="outline" />}>
      Help with this payment
    </ResponsiveDialogTrigger>

    <ResponsiveDialogPopup>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Help with this payment</ResponsiveDialogTitle>

        <ResponsiveDialogDescription>
          Where people most often get stuck, and what to do.
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>

      <ResponsiveDialogPanel>
        <Accordion variant="divided">
          {QUESTIONS.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ResponsiveDialogPanel>
    </ResponsiveDialogPopup>
  </ResponsiveDialog>
)
