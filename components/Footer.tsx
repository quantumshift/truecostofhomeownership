import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-14 pt-8 pb-10 border-t border-neutral-200 text-sm text-neutral-500">
      <Link href="/" className="inline-block mb-6">
        <Image
          src="/images/logo.png"
          alt="True Cost of Homeownership"
          width={150}
          height={57}
          className="w-[130px] h-auto sm:w-[150px]"
        />
      </Link>
      <p className="mb-4">
        This calculator provides rough estimates for planning purposes only, not a substitute for actual quotes,
        bills, or professional advice.
      </p>
      <p className="text-neutral-600">
        <span className="font-medium text-neutral-800">Kirk Rau</span> · Empire Home Loans Inc. · 253-376-5475 ·{' '}
        <a href="mailto:Kirk@EmpireHomeLoans.com" className="text-navy-light hover:underline">
          Kirk@EmpireHomeLoans.com
        </a>
      </p>
      <p className="mt-1 text-neutral-500">Licensed in AZ, TX, WA, NV, CA · NMLS 1466931</p>
    </footer>
  );
}
