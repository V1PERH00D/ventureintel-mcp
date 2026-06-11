import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Next.js received War Room payload:", body);
    
    // Swap this URL if your simulation uses a different n8n webhook!
    const n8nResponse = await fetch('https://coriemickey.app.n8n.cloud/webhook-test/startup/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const contentType = n8nResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await n8nResponse.text();
      return NextResponse.json({ error: 'Bad response format', raw: rawText.substring(0, 200) }, { status: 502 });
    }

    const data = await n8nResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Simulation Proxy crashed:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}