export const faqItems = [
  {
    question: 'What is the true cost of homeownership?',
    answer:
      "It's the full monthly picture of owning a home, not just the mortgage payment. That means principal and interest, property taxes, homeowners insurance, HOA dues if you have them, utilities, routine maintenance, and a reserve for big-ticket repairs like a roof or water heater down the road. Most buyers only budget for the mortgage and get caught off guard by the rest.",
  },
  {
    question: "What's included in the true cost of owning a home beyond the mortgage?",
    answer:
      'Property taxes and homeowners insurance, utilities (electricity, gas, water, trash, internet), routine maintenance like lawn care and gutter cleaning, and a monthly reserve for eventual system replacements. Roof, HVAC, and water heater are the big three. HOA fees get added in too if the property has them.',
  },
  {
    question: 'How much does home maintenance cost per month?',
    answer:
      "A commonly used starting point is about $0.14 per square foot per month, the HUD/VA standard maintenance-and-utilities allowance used in reverse mortgage and VA loan residual income calculations. A 2,000 sq ft home would land around $280/month for routine upkeep. Actual costs vary by home age, condition, and region.",
  },
  {
    question: 'Is this calculator accurate for any state or city?',
    answer:
      "It's built to work anywhere in the U.S., with no regional assumption baked into the defaults. You enter your own purchase price, tax rate, insurance, and utility numbers, so the result reflects your market. The repair reserve figures use national median costs, and we call that out clearly since coastal and West Coast markets often run higher than the rural Midwest or Southeast.",
  },
];

export default function FaqSection() {
  return (
    <section aria-labelledby="faq-heading" className="mt-16 pt-10 border-t border-neutral-200">
      <h2 id="faq-heading" className="text-2xl font-bold text-navy mb-6">
        Common questions
      </h2>
      <div className="space-y-6">
        {faqItems.map((item) => (
          <div key={item.question}>
            <h3 className="text-base font-semibold text-neutral-900 mb-1.5">{item.question}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
