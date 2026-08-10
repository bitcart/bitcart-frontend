import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@bitcart/ui-kit/components"

const FAQ = [
  {
    value: "fees",
    question: "Does Bitcart take a cut of my payments?",

    answer:
      "No. Payments settle straight into the wallet you connect, nothing is deducted on the way.",
  },

  {
    value: "custody",
    question: "Who holds the funds?",
    answer: "You do. Bitcart is non-custodial, so the keys never leave your own infrastructure.",
  },

  {
    value: "currencies",
    question: "Which currencies are supported?",
    answer: "Bitcoin, Lightning, Ethereum, Litecoin, Monero, and more.",
  },
]

export const MultipleAccordionExample: React.FC = () => (
  <Accordion multiple className="gap-2 max-w-md flex w-full flex-col">
    {FAQ.map(({ value, question, answer }) => (
      <AccordionItem key={value} value={value}>
        <AccordionTrigger className="px-4">{question}</AccordionTrigger>
        <AccordionContent className="px-4">{answer}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
)
