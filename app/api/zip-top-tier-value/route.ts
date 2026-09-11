import { NextRequest, NextResponse } from 'next/server';
import zhviTopTier from '@/data/zhvi-top-tier.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let zip: string;
  try {
    const body = await req.json();
    zip = String(body.zip ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'ZIP code must be 5 digits.' }, { status: 400 });
  }

  const values = zhviTopTier.values as Record<string, number>;
  const value = values[zip] ?? null;

  return NextResponse.json({
    zip,
    value,
    asOf: zhviTopTier.asOf,
    source: zhviTopTier.source,
  });
}
