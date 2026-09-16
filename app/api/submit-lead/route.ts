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
  let properties: CalculatorState[];

  try {
    const body = await req.json();
    name = String(body.name ?? '').trim();
    email = String(body.email ?? '').trim();
    address = String(body.address ?? '').trim();
    properties = Array.isArray(body.properties) ? (body.properties as CalculatorState[]) : [];
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!name || !isValidEmail(email) || properties.length === 0 || properties.length > 3) {
    return NextResponse.json({ error: 'Missing or invalid fields.' }, { status: 400 });
  }

  const propertyReports = properties.map((state) => ({
    state,
    totals: calculateSectionTotals(state),
    address: properties.length === 1 ? address : undefined,
  }));
  const anyMarketEstimateFailed = properties.some((state) => state.marketEstimateFailed);

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(CostReportDocument({ name, properties: propertyReports }));
  } catch {
    return NextResponse.json({ error: 'Could not generate report.' }, { status: 500 });
  }

  const resend = new Resend(resendApiKey);
  const pdfBase64 = pdfBuffer.toString('base64');
  const attachment = { filename: 'true-cost-of-homeownership.pdf', content: pdfBase64 };
  const subjectSuffix = propertyReports.length > 1 ? ` (${propertyReports.length} properties)` : '';

  // The Resend SDK does not throw on API-level failures (bad key, unverified domain, etc.),
  // it resolves with { error } instead, so both sends must be checked explicitly rather than
  // relying on a try/catch to catch a real send failure.
  try {
    const userSend = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `Your True Cost of Home Ownership Report${subjectSuffix}`,
      text: buildUserEmailText(name, propertyReports, anyMarketEstimateFailed),
      attachments: [attachment],
    });

    if (userSend.error) {
      console.error('[submit-lead] Resend rejected the report email:', userSend.error);
      return NextResponse.json({ error: 'Email delivery failed.' }, { status: 422 });
    }

    const leadSend = await resend.emails.send({
      from: fromAddress,
      to: leadNotificationEmail,
      subject: `New lead: ${name}, True Cost of Homeownership calculator${subjectSuffix}`,
      text: buildLeadEmailText(name, email, propertyReports, anyMarketEstimateFailed),
      attachments: [attachment],
    });

    if (leadSend.error) {
      console.error('[submit-lead] Resend rejected the lead notification email:', leadSend.error);
      return NextResponse.json({ error: 'Email delivery failed.' }, { status: 422 });
    }
  } catch (err) {
    console.error('[submit-lead] Unexpected error sending via Resend:', err);
    return NextResponse.json({ error: 'Email delivery failed.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

interface PropertyReport {
  state: CalculatorState;
  totals: ReturnType<typeof calculateSectionTotals>;
  address?: string;
}

function buildPropertyEmailBlock(report: PropertyReport, index: number, total: number): string[] {
  const { totals } = report;
  const lines: string[] = [];
  if (total > 1) {
    lines.push(`— Property ${index + 1} of ${total}${report.state.zip ? ` (${report.state.zip})` : ''} —`, '');
  }
  lines.push(
    `Your monthly true cost of home ownership: ${formatCurrency(totals.grandTotal, 0)}`,
    `House Payment: ${formatCurrencyWhole(totals.mortgageMonthly + totals.taxesInsuranceMonthly)}/mo`,
    '',
    `Mortgage: ${formatCurrencyWhole(totals.mortgageMonthly)}/mo`,
    `Taxes, Insurance & HOA: ${formatCurrencyWhole(totals.taxesInsuranceMonthly)}/mo`,
    `Monthly Operating Costs: ${formatCurrencyWhole(totals.utilitiesMonthly)}/mo`,
    `Maintenance & Upkeep: ${formatCurrencyWhole(totals.maintenanceMonthly)}/mo`,
    `System Replacement Reserves: ${formatCurrencyWhole(totals.repairsMonthly)}/mo`,
  );
  return lines;
}

function buildUserEmailText(
  name: string,
  properties: PropertyReport[],
  marketEstimateFailed: boolean,
): string {
  const isSingle = properties.length === 1;
  return [
    `Hi ${name},`,
    '',
    isSingle
      ? "Here's your True Cost of Home Ownership Report. It's attached as a PDF too."
      : `Here are your ${properties.length} True Cost of Home Ownership Reports. They're attached as a single PDF too.`,
    '',
    ...properties.flatMap((report, i) => [...buildPropertyEmailBlock(report, i, properties.length), '']),
    ...(marketEstimateFailed
      ? [
          "Note: we couldn't verify local market data for one or more of these ZIPs, so the luxury-tier classification in this report may not be fully reflected.",
          '',
        ]
      : []),
    'These are planning estimates, not a substitute for actual quotes, bills, or professional advice.',
    '',
    'Kirk Rau · Empire Home Loans Inc.',
    '253-376-5475 · Kirk@EmpireHomeLoans.com',
    'Licensed in AZ, TX, WA, NV, CA · NMLS 1466931',
  ].join('\n');
}

function buildLeadEmailText(
  name: string,
  email: string,
  properties: PropertyReport[],
  marketEstimateFailed: boolean,
): string {
  const isSingle = properties.length === 1;
  return [
    `New lead from the True Cost of Homeownership calculator.`,
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    isSingle ? '' : `Properties run: ${properties.length}`,
    '',
    ...properties.flatMap((report, i) => [...buildPropertyEmailBlock(report, i, properties.length), '']),
    ...(marketEstimateFailed
      ? [
          'Note: local market data could not be verified for one or more ZIPs — luxury-tier classification is unconfirmed.',
          '',
        ]
      : []),
    'Full PDF report is attached.',
  ].join('\n');
}
