'use client';

import { FormEvent, useState } from 'react';
import { CalculatorState, SectionTotals } from '@/lib/types';
import { formatCurrency, formatCurrencyWhole, isValidEmail } from '@/lib/format';
import { HomeIcon, ShieldIcon, BoltIcon, WrenchIcon, ToolboxIcon } from '../ui/Icons';

interface SummarySectionProps {
  state: CalculatorState;
  totals: SectionTotals;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function SummarySection({ state, totals }: SummarySectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const housePaymentMonthly = totals.mortgageMonthly + totals.taxesInsuranceMonthly;

  const breakdownGroups = [
    {
      label: 'The House Payment',
      items: [
        { label: 'Mortgage (P&I + PMI)', amount: totals.mortgageMonthly, Icon: HomeIcon },
        { label: 'Taxes, Insurance & HOA', amount: totals.taxesInsuranceMonthly, Icon: ShieldIcon },
      ],
    },
    {
      label: 'Monthly Operating Costs',
      items: [
        { label: 'Utilities', amount: totals.utilitiesMonthly, Icon: BoltIcon },
        { label: 'Maintenance', amount: totals.maintenanceMonthly, Icon: WrenchIcon },
      ],
    },
    {
      label: "Owner's Reserve",
      items: [{ label: 'System Replacement Reserves', amount: totals.repairsMonthly, Icon: ToolboxIcon }],
    },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
        body: JSON.stringify({ name: trimmedName, email, address: address.trim(), state, totals }),
      });
      if (!res.ok) throw new Error('submit failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="summary" className="scroll-mt-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-navy">Your monthly true cost of home ownership</h2>
        <p className="text-neutral-500 mt-1">Everything combined, not just the mortgage</p>
      </div>

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
      </div>

      <div className="rounded-lg bg-navy text-white p-6 sm:p-8 text-center mb-4">
        <p className="text-sm uppercase tracking-wide text-white/70 mb-2">Your monthly true cost of home ownership</p>
        <p className="text-4xl sm:text-5xl font-bold tabular-nums">{formatCurrency(totals.grandTotal, 0)}</p>
        <p className="text-sm text-white/70 mt-3">
          House Payment:{' '}
          <span className="font-medium text-white">{formatCurrencyWhole(housePaymentMonthly)}/mo</span>
        </p>
      </div>

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
              Check your inbox for the breakdown. It should land in a minute or two.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-sm text-neutral-600 mb-4">
              Enter your name and email below to receive your complete True Cost of Home Ownership Report.
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
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full sm:w-auto rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-light disabled:bg-neutral-300 transition-colors"
            >
              {status === 'submitting' ? 'Sending…' : 'Send True Cost of Home Ownership Report'}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-600 mt-3">
                Something didn&apos;t go through on our end. Mind trying again in a moment?
              </p>
            )}
            <p className="text-xs text-neutral-500 mt-3">
              By submitting this form, you&apos;ll receive your report by email from Kirk Rau, NMLS #1466931, at
              Empire Home Loans Inc., an Equal Housing Lender. Your information will not be sold or shared with
              third parties, and you can unsubscribe from any future emails at any time.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
