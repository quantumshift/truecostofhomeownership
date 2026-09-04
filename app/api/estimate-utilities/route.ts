import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOOL_NAME = 'provide_utility_estimate';
const REQUEST_TIMEOUT_MS = 8000;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[estimate-utilities] ANTHROPIC_API_KEY is not set in this environment.');
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
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: `Estimate typical blended monthly utility costs (year-round average, in whole dollars) for a typical single-family home in ZIP code ${zip}, United States. Base this on that specific area's climate and typical utility rates — a hot, humid, high-rate area should show noticeably higher electricity than a mild, low-rate area, and a cold-winter gas-heating region should show noticeably higher gas than a mild climate. Two different ZIP codes in different climates should produce visibly different numbers, not generic national averages.`,
          },
        ],
        tools: [
          {
            name: TOOL_NAME,
            description:
              'Provide rough blended monthly utility cost estimates in whole dollars for the given ZIP code, reflecting that area\'s specific climate and typical utility rates.',
            input_schema: {
              type: 'object',
              properties: {
                electricity: {
                  type: 'number',
                  description: 'Typical blended monthly electricity bill in dollars, averaged across the year',
                },
                gas: {
                  type: 'number',
                  description:
                    'Typical blended monthly gas/heating bill in dollars, averaged across the year (0 if the area typically has no natural gas service and heats with electricity)',
                },
                waterSewer: { type: 'number', description: 'Typical monthly water & sewer bill in dollars' },
                trash: { type: 'number', description: 'Typical monthly trash/recycling bill in dollars' },
              },
              required: ['electricity', 'gas', 'waterSewer', 'trash'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: TOOL_NAME },
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const bodyText = await response.text();
      console.error(`[estimate-utilities] Anthropic API returned ${response.status}: ${bodyText}`);
      return NextResponse.json({ error: 'Estimate request failed.' }, { status: 502 });
    }

    const data = await response.json();
    const toolUse = data.content?.find((block: { type: string }) => block.type === 'tool_use');
    if (!toolUse) {
      console.error('[estimate-utilities] No tool_use block in response:', JSON.stringify(data));
      return NextResponse.json({ error: 'No estimate returned.' }, { status: 502 });
    }

    const input = toolUse.input as Record<string, number>;
    const result = {
      electricity: clampEstimate(input.electricity),
      gas: clampEstimate(input.gas),
      waterSewer: clampEstimate(input.waterSewer),
      trash: clampEstimate(input.trash),
    };

    return NextResponse.json(result);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[estimate-utilities] Request to Anthropic timed out after ${REQUEST_TIMEOUT_MS}ms`);
      return NextResponse.json({ error: 'Estimate request timed out.' }, { status: 504 });
    }
    console.error('[estimate-utilities] Unexpected error:', err);
    return NextResponse.json({ error: 'Estimate request failed.' }, { status: 502 });
  }
}

function clampEstimate(value: unknown): number {
  const n = typeof value === 'number' ? value : 0;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(2000, Math.round(n)));
}
