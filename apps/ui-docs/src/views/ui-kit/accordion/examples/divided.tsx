import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@bitcart/ui-kit/components"

const FAQ = [
  {
    value: "pending",
    question: "I paid, but nothing has happened yet",

    answer:
      "A payment takes a few minutes to reach the network. The checkout updates by itself once it sees yours.",
  },

  {
    value: "exchange",
    question: "Can I pay from an exchange account?",

    answer:
      "Paying from a wallet you control is safer. Exchanges often delay withdrawals or take their fee out of the amount.",
  },

  {
    value: "custody",
    question: "Who holds the funds?",
    answer:
      "The store does. Bitcart is non-custodial, so payments settle straight into its wallet.",
  },
]

export const DividedAccordionExample: React.FC = () => (
  <Accordion variant="divided" className="max-w-md w-full">
    {FAQ.map(({ value, question, answer }) => (
      <AccordionItem key={value} value={value}>
        <AccordionTrigger>{question}</AccordionTrigger>
        <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
)
