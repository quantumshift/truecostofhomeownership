// State-level average residential electricity rates and monthly bills.
//
// Rate (centsPerKwh): U.S. Energy Information Administration, Electric Power
// Monthly, Table 5.6.A — "Average Price of Electricity to Ultimate Customers
// by End-Use Sector, by State," June 2026 data, released August 26, 2026.
// (https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=table_5_06_a)
//
// Monthly bill (avgMonthlyBill): computed as the June 2026 rate above applied
// to each state's average residential monthly consumption (kWh) from EIA's
// most recent annual survey, "2024 Average Monthly Bill - Residential" (Form
// EIA-861), since EIA does not publish a monthly by-state bill figure and
// consumption moves far more slowly than price.
// (https://www.eia.gov/electricity/sales_revenue_price/pdf/table_5a.pdf)
//
// Puerto Rico is not covered by either EIA table above (EIA's state-level
// price and consumption series are limited to the 50 states + DC). The PR
// figures below are instead sourced from LUMA Energy's published residential
// tariff (~26 cents/kWh as of early 2026) applied to LUMA's own reference
// consumption of ~800 kWh/month — not an EIA figure, and not directly
// comparable in freshness or methodology to the rest of this table.
//
// This is a static reference table, not a live lookup. Refresh periodically
// (e.g. yearly) against the latest EIA release rather than fetching per
// request.
export interface EiaElectricityRate {
  centsPerKwh: number;
  avgMonthlyBill: number;
}

export const EIA_ELECTRICITY_RATES: Record<string, EiaElectricityRate> = {
  AL: { centsPerKwh: 16.40, avgMonthlyBill: 187 },
  AK: { centsPerKwh: 28.21, avgMonthlyBill: 163 },
  AZ: { centsPerKwh: 15.18, avgMonthlyBill: 163 },
  AR: { centsPerKwh: 14.12, avgMonthlyBill: 148 },
  CA: { centsPerKwh: 34.74, avgMonthlyBill: 175 },
  CO: { centsPerKwh: 17.13, avgMonthlyBill: 115 },
  CT: { centsPerKwh: 24.32, avgMonthlyBill: 169 },
  DE: { centsPerKwh: 19.29, avgMonthlyBill: 176 },
  DC: { centsPerKwh: 24.39, avgMonthlyBill: 156 },
  FL: { centsPerKwh: 15.10, avgMonthlyBill: 167 },
  GA: { centsPerKwh: 16.36, avgMonthlyBill: 176 },
  HI: { centsPerKwh: 52.72, avgMonthlyBill: 261 },
  ID: { centsPerKwh: 14.37, avgMonthlyBill: 136 },
  IL: { centsPerKwh: 19.89, avgMonthlyBill: 138 },
  IN: { centsPerKwh: 17.51, avgMonthlyBill: 158 },
  IA: { centsPerKwh: 15.93, avgMonthlyBill: 133 },
  KS: { centsPerKwh: 15.71, avgMonthlyBill: 138 },
  KY: { centsPerKwh: 14.26, avgMonthlyBill: 149 },
  LA: { centsPerKwh: 13.49, avgMonthlyBill: 162 },
  ME: { centsPerKwh: 29.59, avgMonthlyBill: 163 },
  MD: { centsPerKwh: 21.84, avgMonthlyBill: 203 },
  MA: { centsPerKwh: 29.61, avgMonthlyBill: 169 },
  MI: { centsPerKwh: 22.99, avgMonthlyBill: 142 },
  MN: { centsPerKwh: 17.52, avgMonthlyBill: 125 },
  MS: { centsPerKwh: 14.88, avgMonthlyBill: 172 },
  MO: { centsPerKwh: 16.22, avgMonthlyBill: 162 },
  MT: { centsPerKwh: 15.14, avgMonthlyBill: 129 },
  NE: { centsPerKwh: 13.25, avgMonthlyBill: 127 },
  NV: { centsPerKwh: 13.11, avgMonthlyBill: 122 },
  NH: { centsPerKwh: 27.01, avgMonthlyBill: 167 },
  NJ: { centsPerKwh: 24.95, avgMonthlyBill: 165 },
  NM: { centsPerKwh: 15.06, avgMonthlyBill: 98 },
  NY: { centsPerKwh: 29.49, avgMonthlyBill: 168 },
  NC: { centsPerKwh: 14.74, avgMonthlyBill: 150 },
  ND: { centsPerKwh: 14.12, avgMonthlyBill: 145 },
  OH: { centsPerKwh: 19.19, avgMonthlyBill: 162 },
  OK: { centsPerKwh: 14.33, avgMonthlyBill: 155 },
  OR: { centsPerKwh: 16.32, avgMonthlyBill: 144 },
  PA: { centsPerKwh: 21.73, avgMonthlyBill: 178 },
  RI: { centsPerKwh: 29.23, avgMonthlyBill: 166 },
  SC: { centsPerKwh: 15.55, avgMonthlyBill: 163 },
  SD: { centsPerKwh: 15.36, avgMonthlyBill: 153 },
  TN: { centsPerKwh: 14.07, avgMonthlyBill: 162 },
  TX: { centsPerKwh: 15.94, avgMonthlyBill: 175 },
  UT: { centsPerKwh: 13.37, avgMonthlyBill: 103 },
  VT: { centsPerKwh: 24.44, avgMonthlyBill: 140 },
  VA: { centsPerKwh: 17.22, avgMonthlyBill: 178 },
  WA: { centsPerKwh: 14.91, avgMonthlyBill: 142 },
  WV: { centsPerKwh: 15.45, avgMonthlyBill: 159 },
  WI: { centsPerKwh: 19.56, avgMonthlyBill: 126 },
  WY: { centsPerKwh: 15.24, avgMonthlyBill: 132 },
  // Not EIA-sourced — see header comment.
  PR: { centsPerKwh: 26.0, avgMonthlyBill: 208 },
};
