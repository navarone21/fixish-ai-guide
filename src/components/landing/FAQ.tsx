import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can cancel your subscription at any time. No questions asked, no hidden fees.",
    },
    {
      question: "Is my data safe?",
      answer: "Absolutely. We use enterprise-grade encryption and never share your data with third parties. Your privacy is our priority.",
    },
    {
      question: "What devices work with Fix-ISH?",
      answer: "Fix-ISH works on any device with a web browser—desktop, tablet, or mobile. Our responsive design ensures a great experience everywhere.",
    },
    {
      question: "What file types are supported?",
      answer: "We support common image formats (JPG, PNG, HEIC) and video formats (MP4, MOV, AVI). Files up to 20MB per upload.",
    },
    {
      question: "How fast is Fix-ISH?",
      answer: "Our AI typically analyzes images in 2-5 seconds and provides repair guidance within moments. Video analysis may take slightly longer.",
    },
    {
      question: "How is this different from ChatGPT?",
      answer: "Fix-ISH is specialized for repair scenarios with advanced visual detection, part identification, and step-by-step repair instructions. We're built specifically for fixing things.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund you—no questions asked.",
    },
    {
      question: "Can I use Fix-ISH for commercial purposes?",
      answer: "Yes! Our Pro and Enterprise plans are designed for commercial use. Contact us for volume licensing and custom solutions.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-lg font-semibold text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
