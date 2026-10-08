// TBD: Kirk to provide the real pre-approval application URL.
const PRE_APPROVAL_URL_TBD = '#';
// TBD: content hub doesn't exist yet — placeholder until it's built.
const FIVE_STEPS_URL_TBD = '#';
// Neutral third-party rental search site; no business relationship required.
const RENTAL_SEARCH_URL = 'https://www.apartments.com';

function OfferCard({
  eyebrow,
  label,
  href,
  accent,
}: {
  eyebrow: string;
  label: string;
  href: string;
  accent: 'navy' | 'gold' | 'green';
}) {
  const accentClasses =
    accent === 'navy'
      ? 'border-navy/20 hover:border-navy/40'
      : accent === 'gold'
        ? 'border-amber-300 hover:border-amber-400'
        : 'border-emerald-300 hover:border-emerald-400';
  const buttonClasses =
    accent === 'navy'
      ? 'bg-navy text-white hover:bg-navy-light'
      : accent === 'gold'
        ? 'bg-amber-500 text-white hover:bg-amber-600'
        : 'bg-emerald-600 text-white hover:bg-emerald-700';

  return (
    <div className={`rounded-lg border bg-white p-5 flex flex-col items-center text-center gap-3 ${accentClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{eyebrow}</p>
      <a
        href={href}
        className={`w-full rounded-md px-6 py-2.5 text-sm font-semibold transition-colors ${buttonClasses}`}
      >
        {label}
      </a>
    </div>
  );
}

export default function NextStepOffers() {
  return (
    <>
      <div className="mb-6">
        <p className="text-center text-sm font-semibold text-navy mb-4">What&apos;s your next step?</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <OfferCard
            eyebrow="See how your bank's rate measures up"
            label="Get Pre-Approved"
            href={PRE_APPROVAL_URL_TBD}
            accent="navy"
          />
          <OfferCard
            eyebrow="Not ready yet?"
            label="Build Your Plan for Homeownership"
            href={FIVE_STEPS_URL_TBD}
            accent="gold"
          />
          <OfferCard
            eyebrow="Not ready to buy, but it's time to move?"
            label="Plan Your Next Rental"
            href={RENTAL_SEARCH_URL}
            accent="green"
          />
        </div>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed text-center">
        Actual costs will vary by property, region, and other factors. Talk with your financial planner and real
        estate advisor about this estimate.
      </p>
    </>
  );
}
