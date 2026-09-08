import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { CalculatorState, SectionTotals } from './types';
import { formatCurrency, formatCurrencyWhole } from './format';

const NAVY = '#003366';
const NAVY_LIGHT = '#0a5ca8';

const styles = StyleSheet.create({
  page: {
    padding: 40,
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
    marginBottom: 18,
  },
  heroBox: {
    backgroundColor: NAVY,
    borderRadius: 6,
    padding: 20,
    marginBottom: 18,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: NAVY,
    marginBottom: 8,
    marginTop: 14,
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
  explainerBox: {
    backgroundColor: '#f5f7f9',
    borderRadius: 6,
    padding: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  explainerText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#444444',
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
  state: CalculatorState;
  totals: SectionTotals;
}

export default function CostReportDocument({ name, state, totals }: CostReportProps) {
  const breakdown = [
    { label: 'Mortgage (Principal, Interest & PMI)', amount: totals.mortgageMonthly },
    { label: 'Property Taxes & Insurance', amount: totals.taxesInsuranceMonthly },
    { label: 'Utilities', amount: totals.utilitiesMonthly },
    { label: 'Maintenance & Upkeep', amount: totals.maintenanceMonthly },
    { label: 'System Replacement Reserves', amount: totals.repairsMonthly },
  ];

  return (
    <Document title="True Cost of Homeownership: Your Estimate">
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <ShieldMark />
          <Text style={styles.headerText}>Empire Home Loans</Text>
        </View>

        <Text style={styles.title}>Your True Cost of Homeownership</Text>
        <Text style={styles.subtitle}>Prepared for {name || 'you'}. Estimates for planning purposes only.</Text>

        <View style={styles.heroBox}>
          <Text style={styles.heroLabel}>Your monthly true cost of home ownership</Text>
          <Text style={styles.heroTotal}>{formatCurrency(totals.grandTotal, 0)}</Text>
          <Text style={styles.heroSub}>P&amp;I payment: {formatCurrencyWhole(totals.pAndI)}/mo</Text>
        </View>

        <Text style={styles.sectionTitle}>Monthly breakdown</Text>
        {breakdown.map((item) => (
          <View style={styles.row} key={item.label}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue}>{formatCurrency(item.amount)}/mo</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>System replacement detail</Text>
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

        <View style={styles.explainerBox}>
          <Text style={styles.explainerText}>
            This number adds up your mortgage payment (principal, interest, taxes, and insurance), HOA dues if
            you have them, everyday costs like electricity, water and sewer, internet, and trash, plus a rough
            monthly amount set aside so you&apos;re ready when a roof, HVAC system, or water heater eventually
            needs replacing.{'\n\n'}
            Every home is different. Some cost quite a bit less than average to own, others quite a bit more, and
            this is a rough, honest starting point, not a final answer. The goal is simple: help you walk into
            homeownership with a clear-eyed sense of what it actually takes to hold onto this home for the next
            5, 10, 15, or 20 years, not just what it takes to close on it.{'\n\n'}
            Curious whether the maintenance and repair-reserve piece specifically fits your plans? It&apos;s
            worth a quick check with your financial advisor.
          </Text>
        </View>

        <View style={styles.footer}>
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
