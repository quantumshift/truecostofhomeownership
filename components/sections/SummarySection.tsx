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
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const breakdown = [
    { label: 'Mortgage (P&I + PMI)', amount: totals.mortgageMonthly, Icon: HomeIcon },
    { label: 'Property Taxes & Insurance', amount: totals.taxesInsuranceMonthly, Icon: ShieldIcon },
    { label: 'Utilities', amount: totals.utilitiesMonthly, Icon: BoltIcon },
    { label: 'Maintenance & Upkeep', amount: totals.maintenanceMonthly, Icon: WrenchIcon },
    { label: 'Repairs & System Reserves', amount: totals.repairsMonthly, Icon: ToolboxIcon },
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
        body: JSON.stringify({ name: trimmedName, email, state, totals }),
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
        <p className="text-neutral-500 mt-1">Everything combined — not just the mortgage</p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5 mb-4">
        <ul className="divide-y divide-neutral-100">
          {breakdown.map(({ label, amount, Icon }) => (
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

      <div className="rounded-lg bg-navy text-white p-6 sm:p-8 text-center mb-4">
        <p className="text-sm uppercase tracking-wide text-white/70 mb-2">Your monthly true cost of home ownership</p>
        <p className="text-4xl sm:text-5xl font-bold tabular-nums">{formatCurrency(totals.grandTotal, 0)}</p>
        <p className="text-sm text-white/70 mt-3">
          P&amp;I payment: <span className="font-medium text-white">{formatCurrencyWhole(totals.pAndI)}/mo</span>
        </p>
      </div>

      <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-5 mb-8 space-y-3">
        <p className="text-sm text-neutral-700 leading-relaxed">
          This number adds up your mortgage payment (principal, interest, taxes, and insurance), HOA dues if you
          have them, everyday costs like electricity, water and sewer, internet, and trash — plus a rough monthly
          amount set aside so you&apos;re ready when a roof, HVAC system, or water heater eventually needs
          replacing.
        </p>
        <p className="text-sm text-neutral-700 leading-relaxed">
          Every home is different. Some cost quite a bit less than average to own, others quite a bit more — this
          is a rough, honest starting point, not a final answer. The goal is simple: help you walk into
          homeownership with a clear-eyed sense of what it actually takes to hold onto this home for the next 5,
          10, 15, or 20 years, not just what it takes to close on it.
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        {status === 'success' ? (
          <div className="text-center py-4">
            <p className="text-navy font-semibold text-lg mb-1">Sent!</p>
            <p className="text-sm text-neutral-600">
              Check your inbox for the breakdown — it should land in a minute or two.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-sm text-neutral-600 mb-4">
              Enter your info below and we&apos;ll send this breakdown straight to your inbox.
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
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full sm:w-auto rounded-md bg-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-light disabled:bg-neutral-300 transition-colors"
            >
              {status === 'submitting' ? 'Sending…' : 'Email me my results'}
            </button>
            {status === 'error' && (
              <p className="text-sm text-red-600 mt-3">
                Something didn&apos;t go through on our end — mind trying again in a moment?
              </p>
            )}
            <p className="text-xs text-neutral-500 mt-3">
              Your info goes to Kirk Rau at Empire Home Loans so he can follow up and help with next steps.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
