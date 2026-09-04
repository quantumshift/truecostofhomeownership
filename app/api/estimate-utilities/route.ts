import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TOOL_NAME = 'provide_utility_estimate';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Based on your general knowledge of typical residential utility costs for ZIP code ${zip} in the United States, give a rough monthly estimate in whole dollars for a typical single-family home in that area. Use your general regional knowledge (climate, typical utility rates for that area) — you do not have access to live rate data, so give a reasonable planning-level approximation.`,
          },
        ],
        tools: [
          {
            name: TOOL_NAME,
            description: 'Provide rough monthly utility cost estimates in whole dollars for the given ZIP code.',
            input_schema: {
              type: 'object',
              properties: {
                electricitySummer: { type: 'number', description: 'Typical summer monthly electricity bill in dollars' },
                electricityWinter: { type: 'number', description: 'Typical winter monthly electricity bill in dollars' },
                gasSummer: { type: 'number', description: 'Typical summer monthly gas/heating bill in dollars' },
                gasWinter: { type: 'number', description: 'Typical winter monthly gas/heating bill in dollars' },
                waterSewer: { type: 'number', description: 'Typical monthly water & sewer bill in dollars' },
                trash: { type: 'number', description: 'Typical monthly trash/recycling bill in dollars' },
              },
              required: ['electricitySummer', 'electricityWinter', 'gasSummer', 'gasWinter', 'waterSewer', 'trash'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: TOOL_NAME },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Estimate request failed.' }, { status: 502 });
    }

    const data = await response.json();
    const toolUse = data.content?.find((block: { type: string }) => block.type === 'tool_use');
    if (!toolUse) {
      return NextResponse.json({ error: 'No estimate returned.' }, { status: 502 });
    }

    const input = toolUse.input as Record<string, number>;
    const result = {
      electricitySummer: clampEstimate(input.electricitySummer),
      electricityWinter: clampEstimate(input.electricityWinter),
      gasSummer: clampEstimate(input.gasSummer),
      gasWinter: clampEstimate(input.gasWinter),
      waterSewer: clampEstimate(input.waterSewer),
      trash: clampEstimate(input.trash),
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Estimate request failed.' }, { status: 502 });
  }
}

function clampEstimate(value: unknown): number {
  const n = typeof value === 'number' ? value : 0;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(2000, Math.round(n)));
}
