import Image from 'next/image';
import Link from 'next/link';
import Calculator from '@/components/Calculator';
import FaqSection from '@/components/FaqSection';
import { faqItems } from '@/components/FaqSection';
import Footer from '@/components/Footer';

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
      'A free calculator that estimates the true cost of owning a home, including mortgage, property taxes, insurance, utilities, maintenance, and future repairs, not just the mortgage payment.',
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
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="True Cost of Homeownership"
                width={190}
                height={72}
                className="w-[150px] h-auto sm:w-[190px]"
                priority
              />
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight">
            TRUE COST OF HOMEOWNERSHIP CALCULATOR
          </h1>
          <p className="mt-2 max-w-2xl text-navy-light font-medium">Homeownership&rsquo;s mystery number.</p>
          <p className="mt-4 max-w-2xl text-neutral-600 leading-relaxed">
            See the full monthly cost of owning and operating the home, plus a separate Owner&rsquo;s Reserve for
            system repair and replacement.
          </p>
          <p className="mt-4 max-w-2xl text-neutral-600 leading-relaxed">
            Start with the details you know. Review and adjust for accuracy.
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
