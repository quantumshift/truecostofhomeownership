import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { CalculatorState } from '@/lib/types';
import { calculateSectionTotals } from '@/lib/calculations';
import { formatCurrency, formatCurrencyWhole, isValidEmail } from '@/lib/format';
import CostReportDocument from '@/lib/pdf';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_ADDRESS;
  const leadNotificationEmail = process.env.LEAD_NOTIFICATION_EMAIL || 'Kirk@EmpireHomeLoans.com';

  if (!resendApiKey || !fromAddress) {
    return NextResponse.json({ error: 'Email delivery is not configured.' }, { status: 503 });
  }

  let name: string;
  let email: string;
  let address: string;
  let state: CalculatorState;

  try {
    const body = await req.json();
    name = String(body.name ?? '').trim();
    email = String(body.email ?? '').trim();
    address = String(body.address ?? '').trim();
    state = body.state as CalculatorState;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!name || !isValidEmail(email) || !state) {
    return NextResponse.json({ error: 'Missing or invalid fields.' }, { status: 400 });
  }

  const totals = calculateSectionTotals(state);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(CostReportDocument({ name, address, state, totals }));
  } catch {
    return NextResponse.json({ error: 'Could not generate report.' }, { status: 500 });
  }

  const resend = new Resend(resendApiKey);
  const pdfBase64 = pdfBuffer.toString('base64');
  const attachment = { filename: 'true-cost-of-homeownership.pdf', content: pdfBase64 };

  try {
    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: 'Your True Cost of Home Ownership Report',
      text: buildUserEmailText(name, totals),
      attachments: [attachment],
    });

    await resend.emails.send({
      from: fromAddress,
      to: leadNotificationEmail,
      subject: `New lead: ${name}, True Cost of Homeownership calculator`,
      text: buildLeadEmailText(name, email, totals),
      attachments: [attachment],
    });
  } catch {
    return NextResponse.json({ error: 'Email delivery failed.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

function buildUserEmailText(name: string, totals: ReturnType<typeof calculateSectionTotals>): string {
  return [
    `Hi ${name},`,
    '',
    `Here's your True Cost of Home Ownership Report. It's attached as a PDF too.`,
    '',
    `Your monthly true cost of home ownership: ${formatCurrency(totals.grandTotal, 0)}`,
    `House Payment: ${formatCurrencyWhole(totals.mortgageMonthly + totals.taxesInsuranceMonthly)}/mo`,
    '',
    `Mortgage: ${formatCurrencyWhole(totals.mortgageMonthly)}/mo`,
    `Taxes, Insurance & HOA: ${formatCurrencyWhole(totals.taxesInsuranceMonthly)}/mo`,
    `Monthly Operating Costs: ${formatCurrencyWhole(totals.utilitiesMonthly)}/mo`,
    `Maintenance & Upkeep: ${formatCurrencyWhole(totals.maintenanceMonthly)}/mo`,
    `System Replacement Reserves: ${formatCurrencyWhole(totals.repairsMonthly)}/mo`,
    '',
    "These are planning estimates, not a substitute for actual quotes, bills, or professional advice.",
    '',
    'Kirk Rau · Empire Home Loans Inc.',
    '253-376-5475 · Kirk@EmpireHomeLoans.com',
    'Licensed in AZ, TX, WA, NV, CA · NMLS 1466931',
  ].join('\n');
}

function buildLeadEmailText(name: string, email: string, totals: ReturnType<typeof calculateSectionTotals>): string {
  return [
    `New lead from the True Cost of Homeownership calculator.`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    `Monthly true cost of home ownership: ${formatCurrency(totals.grandTotal, 0)}`,
    `Mortgage: ${formatCurrencyWhole(totals.mortgageMonthly)}/mo`,
    `Taxes, Insurance & HOA: ${formatCurrencyWhole(totals.taxesInsuranceMonthly)}/mo`,
    `Monthly Operating Costs: ${formatCurrencyWhole(totals.utilitiesMonthly)}/mo`,
    `Maintenance & Upkeep: ${formatCurrencyWhole(totals.maintenanceMonthly)}/mo`,
    `System Replacement Reserves: ${formatCurrencyWhole(totals.repairsMonthly)}/mo`,
    '',
    'Full PDF report is attached.',
  ].join('\n');
}
