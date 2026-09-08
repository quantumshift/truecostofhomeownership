export const faqItems = [
  {
    question: 'What is the true cost of homeownership?',
    answer:
      "It's the full monthly picture of owning a home, not just the mortgage payment. It includes principal and interest, property taxes, homeowners insurance, HOA dues if applicable, utilities, routine maintenance, and a reserve for larger repairs like a roof or water heater down the road.",
  },
  {
    question: "What's included in the true cost of owning a home beyond the mortgage?",
    answer:
      'Property taxes, homeowners insurance, and HOA dues if applicable. Utilities such as electricity, gas, water, trash, and internet. Routine maintenance like lawn care and gutter cleaning. And a monthly reserve for major system replacements, roof, HVAC, and water heater being the big three.',
  },
  {
    question: 'How much does home maintenance cost per month?',
    answer:
      "A commonly used starting point is about $0.14 per square foot per month, the HUD/VA standard maintenance-and-utilities allowance used in reverse mortgage and VA loan residual income calculations. A 2,000 sq ft home would land around $280/month for routine upkeep. Actual costs vary by home age, condition, and region.",
  },
  {
    question: 'Is this calculator accurate for any state or city?',
    answer:
      "Yes. It's built to work anywhere in the U.S., with no regional assumptions baked into the defaults, you enter your own purchase price, tax rate, insurance, and utility numbers, so the result reflects your market. The one exception is the repair reserve figures, which use national median costs, since coastal and West Coast markets often run higher than the rural Midwest or Southeast, we call that out directly rather than implying false precision.",
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
