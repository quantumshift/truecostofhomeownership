import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOL_NAME = 'provide_market_estimate';
const REQUEST_TIMEOUT_MS = 8000;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[estimate-market] ANTHROPIC_API_KEY is not set in this environment.');
    return NextResponse.json({ error: 'Estimate feature is not configured.' }, { status: 503 });
  }

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Based on general knowledge only (no live MLS/listing data), give two rough planning-level figures for ZIP code ${zip}, United States: (1) the county's current median single-family home sale price, and (2) a typical monthly HOA dues range for luxury communities specifically in that area (not the county-wide average).`,
          },
        ],
        tools: [
          {
            name: TOOL_NAME,
            description: 'Provide a rough county median home price and a typical luxury HOA dues range for the given ZIP code.',
            input_schema: {
              type: 'object',
              properties: {
                countyMedianPrice: {
                  type: 'number',
                  description: 'Rough current median single-family home sale price for the county containing this ZIP, in whole dollars',
                },
                hoaLow: {
                  type: 'number',
                  description: 'Low end of typical monthly HOA dues for luxury communities in this area, in whole dollars',
                },
                hoaHigh: {
                  type: 'number',
                  description: 'High end of typical monthly HOA dues for luxury communities in this area, in whole dollars',
                },
              },
              required: ['countyMedianPrice', 'hoaLow', 'hoaHigh'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: TOOL_NAME },
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const bodyText = await response.text();
      console.error(`[estimate-market] Anthropic API returned ${response.status}: ${bodyText}`);
      return NextResponse.json({ error: 'Estimate request failed.' }, { status: 502 });
    }

    const data = await response.json();
    const toolUse = data.content?.find((block: { type: string }) => block.type === 'tool_use');
    if (!toolUse) {
      console.error('[estimate-market] No tool_use block in response:', JSON.stringify(data));
      return NextResponse.json({ error: 'No estimate returned.' }, { status: 502 });
    }

    const input = toolUse.input as Record<string, number>;
    const result = {
      countyMedianPrice: clamp(input.countyMedianPrice, 20000, 20000000),
      hoaLow: clamp(input.hoaLow, 0, 10000),
      hoaHigh: clamp(input.hoaHigh, 0, 10000),
    };

    return NextResponse.json(result);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[estimate-market] Request to Anthropic timed out after ${REQUEST_TIMEOUT_MS}ms`);
      return NextResponse.json({ error: 'Estimate request timed out.' }, { status: 504 });
    }
    console.error('[estimate-market] Unexpected error:', err);
    return NextResponse.json({ error: 'Estimate request failed.' }, { status: 502 });
  }
}

function clamp(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? value : 0;
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}
