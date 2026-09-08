import Calculator from '@/components/Calculator';
import FaqSection from '@/components/FaqSection';
import { faqItems } from '@/components/FaqSection';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://truecostofhomeownership.com';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'True Cost of Homeownership Calculator',
    url: SITE_URL,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    description:
      'A free calculator that estimates the true monthly cost of owning a home, including mortgage, property taxes, insurance, utilities, maintenance, and future repairs, not just the mortgage payment.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'Empire Home Loans Inc.',
      email: 'Kirk@EmpireHomeLoans.com',
      telephone: '+1-253-376-5475',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white">
        <header className="border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <Logo />
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight">
            True Cost of Homeownership Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-navy-light font-medium">Know it before you owe it.</p>
          <p className="mt-4 max-w-2xl text-neutral-600 leading-relaxed">
            This calculator shows the true monthly cost of owning a home, principal, interest, taxes, insurance,
            utilities, maintenance, and a reserve for future repairs, not just the mortgage payment. Enter your
            numbers below to see your own estimate.
          </p>

          <div className="mt-10">
            <Calculator />
          </div>

          <FaqSection />
        </main>

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Footer />
        </div>
      </div>
    </>
  );
}
