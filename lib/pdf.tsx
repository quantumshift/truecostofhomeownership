import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import {
  CalculatorState,
  SectionTotals,
  MAINTENANCE_RATE_OF_VALUE,
  SYSTEM_REFERENCE_DATA,
  LUXURY_SYSTEM_REFERENCE_DATA,
} from './types';
import { getAutoPmiAnnualRate, getDownPaymentPercent, getLoanAmount } from './calculations';
import { formatCurrency, formatReserveOffsetSentence } from './format';

const CREDIT_LINE_CAVEAT =
  'Credit line amounts are borrowing capacity, not savings, and would need to be repaid with interest if used.';

const NAVY = '#003366';
const NAVY_LIGHT = '#0a5ca8';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 110,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  headerText: {
    fontSize: 13,
    fontWeight: 700,
    color: NAVY,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 20,
  },
  tierLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    color: NAVY_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 2,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 6,
  },
  detailLine: {
    fontSize: 8.5,
    color: '#777777',
    marginBottom: 6,
    lineHeight: 1.4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  rowLabel: {
    color: '#333333',
  },
  rowValue: {
    fontWeight: 700,
    color: '#111111',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
  },
  totalLabel: {
    fontWeight: 700,
    color: '#111111',
  },
  totalValue: {
    fontWeight: 700,
    color: '#111111',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f4f8',
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  subtotalLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: NAVY,
  },
  subtotalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: NAVY,
  },
  methodologyLine: {
    fontSize: 8,
    color: '#888888',
    marginTop: 6,
    lineHeight: 1.4,
  },
  reserveOffsetBox: {
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#dde5ec',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  reserveOffsetHeading: {
    fontSize: 8.5,
    fontWeight: 700,
    color: NAVY_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  table: {
    marginTop: 2,
    marginBottom: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 700,
    color: '#888888',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  tableCell: {
    fontSize: 9,
    color: '#333333',
  },
  colSystem: { width: '22%' },
  colAge: { width: '16%' },
  colLifespan: { width: '18%' },
  colCost: { width: '22%' },
  colReserve: { width: '22%', textAlign: 'right' },
  heroBox: {
    backgroundColor: NAVY,
    borderRadius: 6,
    padding: 20,
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroLabel: {
    fontSize: 9,
    color: '#c7d6e5',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTotal: {
    fontSize: 30,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 9,
    color: '#c7d6e5',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    paddingTop: 10,
  },
  footerDisclaimer: {
    fontSize: 8,
    color: '#888888',
    marginBottom: 6,
    lineHeight: 1.4,
  },
  footerContact: {
    fontSize: 8,
    color: '#555555',
  },
});

function ShieldMark() {
  return (
    <Svg width={22} height={25} viewBox="0 0 30 34">
      <Path d="M15 1L28 6.5V16C28 24.5 22.5 30.8 15 33C7.5 30.8 2 24.5 2 16V6.5L15 1Z" fill={NAVY} />
      <Path d="M15 6L23 9.4V16C23 21.6 19.7 25.7 15 27.3C10.3 25.7 7 21.6 7 16V9.4L15 6Z" fill={NAVY_LIGHT} />
    </Svg>
  );
}

function Row({ label, amount, monthly = true }: { label: string; amount: number; monthly?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>
        {formatCurrency(amount)}
        {monthly ? '/mo' : ''}
      </Text>
    </View>
  );
}

function getPmiTierLabel(downPaymentPercent: number): string {
  if (downPaymentPercent < 5) return 'under 5%';
  if (downPaymentPercent < 10) return '5% to 9.99%';
  if (downPaymentPercent < 15) return '10% to 14.99%';
  if (downPaymentPercent < 20) return '15% to 19.99%';
  return '20% or more';
}

interface CostReportProps {
  name: string;
  address?: string;
  state: CalculatorState;
  totals: SectionTotals;
}

export default function CostReportDocument({ name, address, state, totals }: CostReportProps) {
  const housePaymentMonthly = totals.mortgageMonthly + totals.taxesInsuranceMonthly;
  const operatingCostsMonthly = totals.utilitiesMonthly + totals.maintenanceMonthly;
  const ownersReserveMonthly = totals.repairsMonthly;
  const loanAmount = getLoanAmount(state);
  const downPaymentPercent = getDownPaymentPercent(state);
  const downPaymentDollar =
    state.mortgage.downPaymentMode === 'dollar'
      ? state.mortgage.downPaymentDollar
      : (state.mortgage.purchasePrice * state.mortgage.downPaymentPercent) / 100;

  const pmiRate = getAutoPmiAnnualRate(downPaymentPercent);
  const pmiTier = getPmiTierLabel(downPaymentPercent);

  let mortgageMethodology: string;
  if (!state.mortgage.pmiEnabled) {
    mortgageMethodology =
      'Principal and interest calculated using standard loan amortization. No mortgage insurance included in this figure.';
  } else if (state.mortgage.pmiManualOverride) {
    mortgageMethodology =
      'Mortgage insurance based on the lender quote entered. Principal and interest calculated using standard loan amortization.';
  } else {
    mortgageMethodology = `Mortgage insurance calculated at ${(pmiRate * 100).toFixed(1)}% annually, based on the ${pmiTier} down payment tier. Principal and interest calculated using standard loan amortization.`;
  }

  let luxuryMethodology: string | null = null;
  if (state.isLuxuryMode) {
    luxuryMethodology =
      state.luxuryThresholdSource === 'zillow'
        ? 'Luxury Mode activated because the purchase price meets or exceeds the top third of home values for this ZIP code, based on Zillow Research’s Home Value Index (ZHVI) data.'
        : 'Luxury Mode activated because the purchase price is at least double the AI-estimated county median home price (ZIP-level Zillow data was not available for this ZIP, so this is an AI estimate, not published data).';
  }

  const referenceData = state.isLuxuryMode ? LUXURY_SYSTEM_REFERENCE_DATA : SYSTEM_REFERENCE_DATA;
  const systems = [
    { key: 'roof' as const, ...referenceData.roof, reserve: totals.roofReserve, age: state.repairs.roof.ageYears },
    { key: 'hvac' as const, ...referenceData.hvac, reserve: totals.hvacReserve, age: state.repairs.hvac.ageYears },
    {
      key: 'waterHeater' as const,
      ...referenceData.waterHeater,
      reserve: totals.waterHeaterReserve,
      age: state.repairs.waterHeater.ageYears,
    },
  ];

  const reserveOffsetSentence = formatReserveOffsetSentence(
    state.repairs.startingCashReserve,
    state.repairs.dedicatedCreditLine,
    totals.reserveOffsetAppliedSystems,
  );
  let repairsMethodology =
    'Monthly reserve equals replacement cost divided by years remaining (lifespan minus age, floor of one ' +
    'year), divided by 12. Roof, HVAC, and water heater cost figures are based on data from Angi, Pearl, ' +
    'HomeAdvisor, and Homewyse.';
  if (reserveOffsetSentence) {
    repairsMethodology += ` ${reserveOffsetSentence}`;
    if (state.repairs.dedicatedCreditLine > 0) {
      repairsMethodology += ` ${CREDIT_LINE_CAVEAT}`;
    }
  }

  const maintenanceRatePercent = (MAINTENANCE_RATE_OF_VALUE * 100).toFixed(2);
  const maintenanceMethodology =
    `Maintenance is estimated at ${maintenanceRatePercent}% of your home's purchase price per year, based on ` +
    'National Association of Home Builders (NAHB) data on typical routine maintenance and repair costs. This ' +
    'covers predictable, ongoing upkeep like lawn care, gutters, filters, and general wear, not major system ' +
    "replacements, which are calculated separately below in your Owner's Reserve.";

  const u = state.utilities;
  const utilityLineItems: { label: string; amount: number }[] = [
    { label: 'Electricity', amount: u.electricity.value },
    { label: 'Gas / Heating', amount: u.gas.value },
    { label: 'Water & Sewer', amount: u.waterSewer.value },
    { label: 'Trash / Recycling', amount: u.trash.value },
    { label: 'Internet / Cable', amount: u.internet.value },
  ];
  if (u.other.value > 0) utilityLineItems.push({ label: 'Other', amount: u.other.value });
  if (state.isLuxuryMode) {
    if (u.poolSpa > 0) utilityLineItems.push({ label: 'Pool / Spa Maintenance', amount: u.poolSpa });
    if (u.landscapingCrew > 0) utilityLineItems.push({ label: 'Landscaping Crew', amount: u.landscapingCrew });
    if (u.housekeeping > 0) utilityLineItems.push({ label: 'Housekeeping / Property Staff', amount: u.housekeeping });
    if (u.security > 0) utilityLineItems.push({ label: 'Security System / Monitoring', amount: u.security });
  }

  const metaParts = [`Prepared for ${name || 'you'}`];
  if (address) metaParts.push(address);
  metaParts.push(`Purchase Price: ${formatCurrency(state.mortgage.purchasePrice)}`);
  if (state.marketEstimateFailed) metaParts.push('Local market data unverified for this ZIP');

  return (
    <Document title="True Cost of Home Ownership Report">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <ShieldMark />
          <Text style={styles.headerText}>Empire Home Loans</Text>
        </View>

        <Text style={styles.title}>Your True Cost of Home Ownership Report</Text>
        <Text style={styles.subtitle}>{metaParts.join(' | ')}</Text>

        <Text style={styles.tierLabel}>Tier 1</Text>
        <Text style={styles.tierTitle}>The House Payment</Text>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Mortgage</Text>
          <Text style={styles.detailLine}>
            Purchase Price: {formatCurrency(state.mortgage.purchasePrice)} · Down Payment:{' '}
            {formatCurrency(downPaymentDollar)} ({downPaymentPercent.toFixed(2)}%) · Rate:{' '}
            {state.mortgage.interestRate.toFixed(3)}% · Term: {state.mortgage.loanTerm} yrs · Loan Amount:{' '}
            {formatCurrency(loanAmount)}
          </Text>
          <Row label="Principal, Interest & Mortgage Insurance" amount={totals.mortgageMonthly} />
          <Text style={styles.methodologyLine}>{mortgageMethodology}</Text>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Property Taxes &amp; Insurance{state.zip ? ` (${state.zip})` : ''}</Text>
          <Row label="Monthly Property Tax" amount={totals.propertyTaxMonthly} />
          <Row label="Monthly Homeowners Insurance" amount={totals.homeownersInsuranceMonthly} />
          <Row label="HOA Fees (monthly)" amount={totals.hoaMonthly} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Monthly Taxes, Insurance &amp; HOA</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.taxesInsuranceMonthly)}/mo</Text>
          </View>
          <Text style={styles.methodologyLine}>
            Property tax is the annual property tax figure divided by 12. Insurance and HOA are entered directly.
          </Text>
          {luxuryMethodology && <Text style={styles.methodologyLine}>{luxuryMethodology}</Text>}
        </View>

        <View style={styles.subtotalRow} wrap={false}>
          <Text style={styles.subtotalLabel}>
            House Payment Total (P&amp;I, Mortgage Insurance, Taxes, Insurance &amp; HOA)
          </Text>
          <Text style={styles.subtotalValue}>{formatCurrency(housePaymentMonthly)}/mo</Text>
        </View>

        <Text style={styles.tierLabel}>Tier 2</Text>
        <Text style={styles.tierTitle}>Maintenance &amp; Utilities</Text>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Monthly Utilities</Text>
          {utilityLineItems.map((item) => (
            <Row key={item.label} label={item.label} amount={item.amount} />
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Monthly Utilities</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.utilitiesMonthly)}/mo</Text>
          </View>
          <Text style={styles.methodologyLine}>
            Entered directly, or estimated by AI. Electricity is anchored to EIA state-level average rates,
            adjusted for local climate and ZIP-specific factors. Other utility categories are estimated by AI
            based on regional context.
          </Text>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Maintenance</Text>
          <Text style={styles.detailLine}>
            {formatCurrency(state.mortgage.purchasePrice)} x {maintenanceRatePercent}% ÷ 12 ={' '}
            {formatCurrency(totals.maintenanceMonthly)}/mo
          </Text>
          <Row label="Total Monthly Maintenance" amount={totals.maintenanceMonthly} />
          <Text style={styles.methodologyLine}>{maintenanceMethodology}</Text>
        </View>

        <View style={styles.subtotalRow} wrap={false}>
          <Text style={styles.subtotalLabel}>Maintenance &amp; Utilities Total</Text>
          <Text style={styles.subtotalValue}>{formatCurrency(operatingCostsMonthly)}/mo</Text>
        </View>

        <Text style={styles.tierLabel}>Tier 3</Text>
        <Text style={styles.tierTitle}>Owner&apos;s Reserve</Text>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>System Replacements</Text>
          {(state.repairs.startingCashReserve > 0 || state.repairs.dedicatedCreditLine > 0) && (
            <View style={styles.reserveOffsetBox}>
              <Text style={styles.reserveOffsetHeading}>Reserve Offset</Text>
              {state.repairs.startingCashReserve > 0 && (
                <Row label="Starting Cash Reserve" amount={state.repairs.startingCashReserve} monthly={false} />
              )}
              {state.repairs.dedicatedCreditLine > 0 && (
                <Row label="Dedicated Credit Line" amount={state.repairs.dedicatedCreditLine} monthly={false} />
              )}
            </View>
          )}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, styles.colSystem]}>System</Text>
              <Text style={[styles.tableHeaderCell, styles.colAge]}>Age</Text>
              <Text style={[styles.tableHeaderCell, styles.colLifespan]}>Lifespan</Text>
              <Text style={[styles.tableHeaderCell, styles.colCost]}>Median Cost</Text>
              <Text style={[styles.tableHeaderCell, styles.colReserve]}>Monthly Reserve</Text>
            </View>
            {systems.map((system) => (
              <View style={styles.tableRow} key={system.key}>
                <Text style={[styles.tableCell, styles.colSystem]}>{system.label}</Text>
                <Text style={[styles.tableCell, styles.colAge]}>{system.age} yrs</Text>
                <Text style={[styles.tableCell, styles.colLifespan]}>{system.lifespan} yrs</Text>
                <Text style={[styles.tableCell, styles.colCost]}>{formatCurrency(system.cost)}</Text>
                <Text style={[styles.tableCell, styles.colReserve]}>{formatCurrency(system.reserve)}/mo</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Monthly System Replacement Reserve</Text>
            <Text style={styles.totalValue}>{formatCurrency(totals.repairsMonthly)}/mo</Text>
          </View>
          <Text style={styles.methodologyLine}>{repairsMethodology}</Text>
        </View>

        <View style={styles.subtotalRow} wrap={false}>
          <Text style={styles.subtotalLabel}>Owner&apos;s Reserve Total (System Replacement Reserve)</Text>
          <Text style={styles.subtotalValue}>{formatCurrency(ownersReserveMonthly)}/mo</Text>
        </View>

        <View style={styles.heroBox} wrap={false}>
          <Text style={styles.heroLabel}>Your monthly true cost of home ownership</Text>
          <Text style={styles.heroTotal}>{formatCurrency(totals.grandTotal)}</Text>
          <Text style={styles.heroSub}>House Payment: {formatCurrency(housePaymentMonthly)}/mo</Text>
        </View>

        <View style={styles.footer} fixed>
          {state.marketEstimateFailed && (
            <Text style={styles.footerDisclaimer}>
              Note: We couldn&apos;t verify local market data for this ZIP when this report was generated, so the
              luxury-tier classification above may not be fully reflected.
            </Text>
          )}
          <Text style={styles.footerDisclaimer}>
            This calculator provides rough estimates for planning purposes only, not a substitute for actual
            quotes, bills, or professional advice. National median costs are used for repair reserves and vary by
            region.
          </Text>
          <Text style={styles.footerContact}>
            Kirk Rau · Empire Home Loans Inc. · 253-376-5475 · Kirk@EmpireHomeLoans.com
          </Text>
          <Text style={styles.footerContact}>Licensed in AZ, TX, WA, NV, CA · NMLS 1466931</Text>
        </View>
      </Page>
    </Document>
  );
}
