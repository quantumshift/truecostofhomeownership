#!/usr/bin/env node
/**
 * Refreshes data/zhvi-top-tier.json from Zillow Research's public ZHVI top-tier
 * (67th-100th percentile), ZIP-level, smoothed & seasonally-adjusted CSV.
 *
 * Zillow publishes a new cut of this file on/around the 16th of each month
 * (see https://www.zillow.com/research/data/). Re-run this script monthly:
 *
 *   node scripts/refresh-zillow-zhvi.mjs
 *
 * Source page: https://www.zillow.com/research/data/ -> Home Values ->
 * "ZHVI All Homes- Top Tier Time Series ($)" -> Geography: ZIP Code
 *
 * If Zillow changes this filename, find the new one on that page (open the
 * "Download" link for the same data type / geography combination) and update
 * SOURCE_URL below.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SOURCE_URL =
  'https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.67_1.0_sm_sa_month.csv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'zhvi-top-tier.json');

// Minimal RFC4180 CSV line parser (handles quoted fields containing commas, e.g. "Mobile, AL").
function parseCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

async function main() {
  console.log(`Downloading ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Download failed: HTTP ${res.status}`);
  }
  const text = await res.text();
  const lines = text.split('\n').filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error('Downloaded CSV has no data rows.');
  }

  const header = parseCsvLine(lines[0]);
  const regionNameIdx = header.indexOf('RegionName');
  if (regionNameIdx === -1) {
    throw new Error('Could not find RegionName column in CSV header — Zillow may have changed the file format.');
  }
  // The last header column is the most recent month's date (e.g. "2026-07-31").
  const lastDateColIdx = header.length - 1;
  const asOf = header[lastDateColIdx];

  const values = {};
  let rowCount = 0;
  let valueCount = 0;
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    if (fields.length <= lastDateColIdx) continue;
    const zip = fields[regionNameIdx].trim().padStart(5, '0');
    if (!/^\d{5}$/.test(zip)) continue;
    rowCount++;
    const raw = fields[lastDateColIdx];
    const value = Number(raw);
    if (raw !== '' && Number.isFinite(value) && value > 0) {
      values[zip] = Math.round(value);
      valueCount++;
    }
  }

  const output = {
    source: 'Zillow Research ZHVI, Top Tier (67th-100th percentile), ZIP-level, smoothed & seasonally adjusted',
    sourceUrl: SOURCE_URL,
    asOf,
    generatedAt: new Date().toISOString(),
    zipCount: valueCount,
    values,
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(output));
  console.log(`Wrote ${valueCount} ZIP values (of ${rowCount} ZIP rows seen) as of ${asOf} to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
