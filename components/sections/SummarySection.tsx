'use client';

import { FormEvent, useState } from 'react';
import { CalculatorState, MAX_PROPERTIES, SectionTotals } from '@/lib/types';
import { calculateSectionTotals } from '@/lib/calculations';
import { formatCurrency, formatCurrencyWhole, isValidEmail } from '@/lib/format';
import { HomeIcon, ShieldIcon, BoltIcon, WrenchIcon } from '../ui/Icons';
import TierGroup from '../TierGroup';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

// TBD: Kirk to provide the real pre-approval application URL.
const PRE_APPROVAL_URL_TBD = '#';
// TBD: content hub doesn't exist yet — placeholder until it's built.
const FIVE_STEPS_URL_TBD = '#';
// Neutral third-party rental search site; no business relationship required.
const RENTAL_SEARCH_URL = 'https://www.apartments.com';

interface EntrySummaryProps {
  mode: 'entry';
  state: CalculatorState;
  totals: SectionTotals;
  propertyNumber: number;
  canAddAnother: boolean;
  onAddAnotherProperty: () => void;
  onFinishEntry: () => void;
}

interface LeadCaptureSummaryProps {
  mode: 'leadCapture';
  properties: CalculatorState[];
}

type SummarySectionProps = EntrySummaryProps | LeadCaptureSummaryProps;

function BreakdownCard({ totals }: { totals: SectionTotals }) {
  const breakdownGroups = [
    {
      label: 'The House Payment',
      items: [
        { label: 'Mortgage (P&I + PMI)', amount: totals.mortgageMonthly, Icon: HomeIcon },
        { label: 'Taxes, Insurance & HOA', amount: totals.taxesInsuranceMonthly, Icon: ShieldIcon },
      ],
    },
    {
      label: 'Monthly Operating Expenses',
      items: [
        { label: 'Utilities', amount: totals.utilitiesMonthly, Icon: BoltIcon },
        { label: 'Maintenance', amount: totals.maintenanceMonthly, Icon: WrenchIcon },
      ],
    },
  ];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 mb-4">
      {breakdownGroups.map((group, i) => (
        <div key={group.label} className={i > 0 ? 'mt-4 pt-4 border-t border-neutral-200' : ''}>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-light mb-1.5">{group.label}</p>
          <ul className="divide-y divide-neutral-100">
            {group.items.map(({ label, amount, Icon }) => (
              <li key={label} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-navy shrink-0">
                    <Icon />
                  </span>
                  <span className="text-sm font-medium text-neutral-700">{label}</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                  {formatCurrencyWhole(amount)}/mo
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Stage 1: House Payment + Monthly Operating Expenses = True Monthly Cost of Homeownership */}
      <div className="mt-4 pt-4 border-t border-neutral-200 space-y-1.5">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>House Payment</span>
          <span className="tabular-nums">{formatCurrencyWhole(totals.houseMonthly)}/mo</span>
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>+ Monthly Operating Expenses</span>
          <span className="tabular-nums">{formatCurrencyWhole(totals.operatingExpensesMonthly)}/mo</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200">
          <span className="text-sm font-semibold text-navy">= True Monthly Cost of Homeownership</span>
          <span className="text-base font-bold text-navy tabular-nums">
            {formatCurrencyWhole(totals.trueMonthlyCost)}/mo
          </span>
        </div>
      </div>

      {/* Stage 2: True Monthly Cost of Homeownership + Owner's Reserve = True Cost of Homeownership */}
      <div className="mt-5 pt-4 border-t-2 border-navy/20 space-y-1.5">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>True Monthly Cost of Homeownership</span>
          <span className="tabular-nums">{formatCurrencyWhole(totals.trueMonthlyCost)}/mo</span>
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>+ Owner&apos;s Reserve</span>
          <span className="tabular-nums">{formatCurrencyWhole(totals.repairsMonthly)}/mo</span>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-navy text-white p-5 sm:p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-white/70 mb-1.5">= True Cost of Homeownership</p>
        <p className="text-3xl sm:text-4xl font-bold tabular-nums">{formatCurrency(totals.grandTotal, 0)}/mo</p>
      </div>
    </div>
  );
}

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

export default function SummarySection(props: SummarySectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (props.mode !== 'leadCapture') return;

    const trimmedName = name.trim();
    let hasError = false;

    if (!trimmedName) {
      setNameError('Please enter your name.');
      hasError = true;
    } else {
      setNameError(null);
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (hasError) return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email,
          address: address.trim(),
          properties: props.properties,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (props.mode === 'leadCapture') {
    const { properties } = props;
    const isSingle = properties.length === 1;

    return (
      <section id="summary" className="scroll-mt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">
            {isSingle ? 'Your True Cost of Homeownership' : `Your ${properties.length} property reports`}
          </h2>
          <p className="text-neutral-500 mt-1">
            {isSingle
              ? 'What it will likely cost to own this home'
              : "You'll receive a complete report for each property in one email"}
          </p>
        </div>

        {isSingle ? (
          <BreakdownCard totals={calculateSectionTotals(properties[0])} />
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-white p-5 mb-4">
            <ul className="divide-y divide-neutral-100">
              {properties.map((property, i) => {
                const propTotals = calculateSectionTotals(property);
                return (
                  <li key={i} className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-neutral-700">
                      Property {i + 1}
                      {property.zip ? ` (${property.zip})` : ''}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                      {formatCurrencyWhole(propTotals.grandTotal)}/mo
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-5 mb-8 space-y-3">
          <p className="text-sm text-neutral-700 leading-relaxed">
            This tool exists because the mortgage payment alone is just the beginning of the true cost of owning a
            home. Actual costs will vary by property, region, and various other factors, but this calculator
            provides a true number to start your homeownership discussion.
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed">
            We encourage you to get feedback on this estimate from your financial planner and real estate advisor.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          {status === 'success' ? (
            <div className="text-center py-4">
              <p className="text-navy font-semibold text-lg mb-1">Sent!</p>
              <p className="text-sm text-neutral-600">
                Check your inbox for {isSingle ? 'the breakdown' : `all ${properties.length} reports`}. It should
                land in a minute or two.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-sm text-neutral-600 mb-4">
                Enter your name and email below to receive your complete True Cost of Homeownership{' '}
                {isSingle ? 'Report' : `Reports (${properties.length})`}.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 mb-4">
                <div>
                  <label htmlFor="leadName" className="text-sm font-medium text-neutral-700 mb-1.5 block">
                    Full name
                  </label>
                  <input
                    id="leadName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light"
                    aria-invalid={!!nameError}
                  />
                  {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
                </div>
                <div>
                  <label htmlFor="leadEmail" className="text-sm font-medium text-neutral-700 mb-1.5 block">
                    Email address
                  </label>
                  <input
                    id="leadEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light"
                    aria-invalid={!!emailError}
                  />
                  {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
                </div>
              </div>
              {isSingle && (
                <div className="mb-4">
                  <label htmlFor="leadAddress" className="text-sm font-medium text-neutral-700 mb-1.5 block">
                    Property address <span className="font-normal text-neutral-400">(optional)</span>
                  </label>
                  <input
                    id="leadAddress"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-light focus:border-navy-light"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Add the address if you&apos;d like your report customized for a specific home.
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full sm:w-auto rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-light disabled:bg-neutral-300 transition-colors"
              >
                {status === 'submitting'
                  ? 'Sending…'
                  : `Send True Cost of Homeownership ${isSingle ? 'Report' : `Reports (${properties.length})`}`}
              </button>
              {status === 'error' && (
                <p className="text-sm text-red-600 mt-3">
                  Something didn&apos;t go through on our end. Mind trying again in a moment?
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-3">
                By submitting this form, you&apos;ll receive your report{isSingle ? '' : 's'} by email from Kirk
                Rau, NMLS #1466931, at Empire Home Loans Inc., an Equal Housing Lender. Your information will not
                be sold or shared with third parties, and you can unsubscribe from any future emails at any time.
              </p>
            </form>
          )}
        </div>
      </section>
    );
  }

  const { state, totals, propertyNumber, canAddAnother, onAddAnotherProperty, onFinishEntry } = props;

  return (
    <section id="summary" className="scroll-mt-6">
      {propertyNumber > 1 && (
        <p className="text-xs font-semibold uppercase tracking-wide text-navy-light mb-4 text-center">
          Property {propertyNumber}
        </p>
      )}

      <div className="mb-4">
        <TierGroup id="true-cost-total" title="True Cost Breakdown" subtitle="All three elements, broken out">
          <BreakdownCard totals={totals} />
        </TierGroup>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 space-y-3 mb-8">
        <div className={canAddAnother ? 'grid gap-3 sm:grid-cols-2' : ''}>
          {canAddAnother && (
            <button
              type="button"
              onClick={onAddAnotherProperty}
              className="w-full rounded-md border border-navy px-6 py-2.5 text-sm font-semibold text-navy hover:bg-navy/5 transition-colors"
            >
              + Add another property
            </button>
          )}
          <button
            type="button"
            onClick={onFinishEntry}
            className="w-full rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
          >
            {propertyNumber > 1 ? "I'm done — get my reports" : 'Get my report'}
          </button>
        </div>
        {canAddAnother && (
          <p className="text-xs text-neutral-500 text-center">
            You can run up to {MAX_PROPERTIES - propertyNumber} more{' '}
            {MAX_PROPERTIES - propertyNumber === 1 ? 'property' : 'properties'} in this same session, then get
            every report in a single email.
          </p>
        )}
      </div>

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
            label="Get the 5 Steps to Thriving Homeownership"
            href={FIVE_STEPS_URL_TBD}
            accent="gold"
          />
          <OfferCard
            eyebrow="Not ready to buy, but it's time to move?"
            label="Find Your Next Rental"
            href={RENTAL_SEARCH_URL}
            accent="green"
          />
        </div>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed text-center">
        Actual costs will vary by property, region, and other factors. Talk with your financial planner and real
        estate advisor about this estimate.
      </p>
    </section>
  );
}
