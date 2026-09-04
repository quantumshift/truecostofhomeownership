import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TOOL_NAME = 'provide_market_estimate';

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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `A home-cost calculator needs two rough, planning-level figures for ZIP code ${zip} in the United States, based on your general knowledge only (you don't have access to live MLS or listing data):

1. A rough estimate of the county's current median single-family home sale price (the county that ZIP code sits in).
2. A rough monthly HOA dues range typical of higher-end/luxury residential communities in that area specifically (not the county-wide average — the higher tier of communities, since that's the tier this figure is used for).

Give your best reasonable approximation for both, grounded in what you know about that area's housing market.`,
          },
        ],
        tools: [
          {
            name: TOOL_NAME,
            description: 'Provide a rough county median home price and a typical higher-end HOA dues range for the given ZIP code.',
            input_schema: {
              type: 'object',
              properties: {
                countyMedianPrice: {
                  type: 'number',
                  description: 'Rough current median single-family home sale price for the county containing this ZIP, in whole dollars',
                },
                hoaLow: {
                  type: 'number',
                  description: 'Low end of typical monthly HOA dues for higher-end communities in this area, in whole dollars',
                },
                hoaHigh: {
                  type: 'number',
                  description: 'High end of typical monthly HOA dues for higher-end communities in this area, in whole dollars',
                },
              },
              required: ['countyMedianPrice', 'hoaLow', 'hoaHigh'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: TOOL_NAME },
      }),
    });

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
    console.error('[estimate-market] Unexpected error:', err);
    return NextResponse.json({ error: 'Estimate request failed.' }, { status: 502 });
  }
}

function clamp(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? value : 0;
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}
