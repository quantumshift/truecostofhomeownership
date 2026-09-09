import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { CalculatorState, SectionTotals, MAINTENANCE_RATE_PER_SQFT } from './types';
import { getDownPaymentPercent, getLoanAmount } from './calculations';
import { formatCurrency, formatCurrencyWhole } from './format';

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
  tagline: {
    fontSize: 11,
    fontWeight: 700,
    color: NAVY_LIGHT,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 18,
  },
  heroBox: {
    backgroundColor: NAVY,
    borderRadius: 6,
    padding: 20,
    marginBottom: 20,
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 8.5,
    color: '#888888',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
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
  detailLine: {
    fontSize: 8.5,
    color: '#777777',
    marginTop: 6,
    lineHeight: 1.4,
  },
  bubbleBox: {
    backgroundColor: '#f0f4f8',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  bubbleText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#444444',
  },
  bubbleCitation: {
    fontSize: 8,
    lineHeight: 1.5,
    color: '#666666',
    marginTop: 6,
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

interface CostReportProps {
  name: string;
  address?: string;
  state: CalculatorState;
  totals: SectionTotals;
}

export default function CostReportDocument({ name, address, state, totals }: CostReportProps) {
  const housePaymentMonthly = totals.mortgageMonthly + totals.taxesInsuranceMonthly;
  const loanAmount = getLoanAmount(state);
  const downPaymentPercent = getDownPaymentPercent(state);
  const downPaymentDollar =
    state.mortgage.downPaymentMode === 'dollar'
      ? state.mortgage.downPaymentDollar
      : (state.mortgage.purchasePrice * state.mortgage.downPaymentPercent) / 100;

  return (
    <Document title="True Cost of Home Ownership Report">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <ShieldMark />
          <Text style={styles.headerText}>Empire Home Loans</Text>
        </View>

        <Text style={styles.title}>Your True Cost of Home Ownership Report</Text>
        <Text style={styles.tagline}>Know it before you owe it.</Text>
        <Text style={styles.subtitle}>
          Prepared for {name || 'you'}
          {address ? ` | ${address}` : ''}. Estimates for planning purposes only.
        </Text>

        <View style={styles.heroBox}>
          <Text style={styles.heroLabel}>Your monthly true cost of home ownership</Text>
          <Text style={styles.heroTotal}>{formatCurrency(totals.grandTotal, 0)}</Text>
          <Text style={styles.heroSub}>House Payment: {formatCurrencyWhole(housePaymentMonthly)}/mo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mortgage</Text>
          <Text style={styles.sectionSubtitle}>
            Your principal and interest, the core loan payment, calculated from what you entered.
          </Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Principal, Interest &amp; Mortgage Insurance</Text>
            <Text style={styles.rowValue}>{formatCurrency(totals.mortgageMonthly)}/mo</Text>
          </View>
          <Text style={styles.detailLine}>
            Purchase Price: {formatCurrencyWhole(state.mortgage.purchasePrice)} · Down Payment:{' '}
            {formatCurrencyWhole(downPaymentDollar)} ({downPaymentPercent.toFixed(1)}%) · Rate:{' '}
            {state.mortgage.interestRate.toFixed(3)}% · Term: {state.mortgage.loanTerm} yrs · Loan Amount:{' '}
            {formatCurrencyWhole(loanAmount)}
          </Text>
          <View style={styles.bubbleBox}>
            <Text style={styles.bubbleText}>
              Principal and interest are usually your largest fixed monthly cost. Mortgage insurance typically
              applies when the down payment is below 20%, and is removed once enough equity is built.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Property Taxes &amp; Insurance{state.zip ? ` (ZIP ${state.zip})` : ''}
          </Text>
          <Text style={styles.sectionSubtitle}>What the county and your insurer expect.</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Taxes, Insurance &amp; HOA</Text>
            <Text style={styles.rowValue}>{formatCurrency(totals.taxesInsuranceMonthly)}/mo</Text>
          </View>
          <View style={styles.bubbleBox}>
            <Text style={styles.bubbleText}>
              Property tax rates vary by county and state. Insurance depends on the home&apos;s age, roof
              condition, and local weather risk. HOA dues, when present, are just as fixed and recurring as taxes
              and insurance, which is why they&apos;re included here. For the most accurate insurance figure, a
              quote from a licensed insurance professional will beat any estimate.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Operating Costs</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Monthly Operating Costs</Text>
            <Text style={styles.rowValue}>{formatCurrency(totals.utilitiesMonthly)}/mo</Text>
          </View>
          <View style={styles.bubbleBox}>
            <Text style={styles.bubbleText}>
              Utility costs vary with home size, age, insulation quality, and climate. This estimate is built
              from general regional data, not live utility rates, compare it against actual bills from the
              seller or local utility provider before relying on it. These costs begin the month you take
              ownership and continue for as long as you hold the property.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance &amp; Upkeep</Text>
          <Text style={styles.sectionSubtitle}>
            Routine, predictable upkeep: lawn care, gutters, filters, pest control, general wear.
          </Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Monthly Maintenance &amp; Upkeep</Text>
            <Text style={styles.rowValue}>{formatCurrency(totals.maintenanceMonthly)}/mo</Text>
          </View>
          <Text style={styles.detailLine}>
            {state.maintenance.squareFootage.toLocaleString()} sq ft × ${MAINTENANCE_RATE_PER_SQFT.toFixed(2)}/sq
            ft = {formatCurrency(totals.maintenanceMonthly)}/mo
          </Text>
          <View style={styles.bubbleBox}>
            <Text style={styles.bubbleText}>
              This figure is separate from system replacements, addressed below: routine upkeep is a
              predictable, recurring cost, while a system replacement is irregular and considerably larger. The
              $0.14 per square foot standard is a baseline, not a forecast. A newer home with well-maintained
              systems can run well under this figure for decades; an older home with undocumented past work or
              areas left unaddressed for years can run well above it. Condition and maintenance history move
              this number more than square footage alone.
            </Text>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>System Replacements</Text>
          <Text style={styles.sectionSubtitle}>A monthly reserve based on how old each system is.</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Roof (age {state.repairs.roof.ageYears} yrs, 25 yr typical lifespan)</Text>
            <Text style={styles.rowValue}>{formatCurrency(totals.roofReserve)}/mo</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>HVAC (age {state.repairs.hvac.ageYears} yrs, 17 yr typical lifespan)</Text>
            <Text style={styles.rowValue}>{formatCurrency(totals.hvacReserve)}/mo</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>
              Water Heater (age {state.repairs.waterHeater.ageYears} yrs, 10 yr typical lifespan)
            </Text>
            <Text style={styles.rowValue}>{formatCurrency(totals.waterHeaterReserve)}/mo</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { fontWeight: 700 }]}>Total Monthly System Replacement Reserve</Text>
            <Text style={styles.rowValue}>{formatCurrency(totals.repairsMonthly)}/mo</Text>
          </View>
          <View style={styles.bubbleBox}>
            <Text style={styles.bubbleText}>
              Replacement costs vary by region: coastal and West Coast markets often exceed the rural Midwest or
              Southeast due to labor rates and building codes, so a local contractor quote will be more accurate
              than any national figure. A system already past its typical lifespan is treated as due within the
              next year. This reserve is not part of a pre-approval letter or closing disclosure, but it&apos;s a
              real, recurring cost of ownership. Building it is optional, common alternatives without one include
              a credit card, a family loan, or borrowing against home equity. It&apos;s worth reviewing this
              estimate with a financial advisor to confirm it fits your specific plans.
            </Text>
            <Text style={styles.bubbleCitation}>
              Roof cost is based on Angi&apos;s 2026 cost data for architectural shingle roof replacement. HVAC
              cost is based on 2026 data from Angi and Pearl, reflecting a full system replacement rather than a
              single component. Water heater cost is based on 2026 data from Angi, HomeAdvisor, and Homewyse for
              a standard tank-style unit, not tankless.
            </Text>
            {state.isLuxuryMode && (
              <Text style={styles.bubbleCitation}>
                Luxury-tier figures are based on research across three luxury real estate markets: King County,
                WA; Los Angeles County, CA; and the Hamptons, NY.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Your monthly true cost of home ownership</Text>
          <Text style={styles.sectionSubtitle}>Everything combined, not just the mortgage</Text>
          <View style={styles.bubbleBox}>
            <Text style={styles.bubbleText}>
              We built this to put a real number on what people call the &quot;hidden costs&quot; of
              homeownership.{'\n\n'}
              This number won&apos;t be perfect, actual costs will vary by property condition, region, and
              additional circumstances, but it&apos;s a really good starting point for smart conversations about
              future expenses.{'\n\n'}
              Sharing this report with your financial planner for their feedback wouldn&apos;t be a horrible
              idea.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
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
