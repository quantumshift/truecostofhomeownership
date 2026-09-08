import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://truecostofhomeownership.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'True Cost of Homeownership Calculator: True Monthly Cost of Owning a Home',
  description:
    "See the true cost of homeownership before you buy. This free calculator adds up the true monthly cost of owning a home, including mortgage, taxes, insurance, utilities, maintenance, and future repairs, all in one honest number.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'True Cost of Homeownership Calculator: True Monthly Cost of Owning a Home',
    description:
      "See the true cost of homeownership before you buy. This free calculator adds up the true monthly cost of owning a home, not just the mortgage payment.",
    url: SITE_URL,
    siteName: 'True Cost of Homeownership Calculator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'True Cost of Homeownership Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'True Cost of Homeownership Calculator',
    description:
      'See the true monthly cost of owning a home, including mortgage, taxes, insurance, utilities, maintenance, and future repairs, all in one number.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
