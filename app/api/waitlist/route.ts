import { NextResponse } from "next/server";

const emailPattern = /^\S+@\S+\.\S+$/;

export async function POST(request: Request) {
  const { email } = await request.json().catch(() => ({}));

  if (typeof email !== "string" || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const webhookUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET;

  if (!webhookUrl || !secret) {
    return NextResponse.json({ error: "Waitlist registration is not configured." }, { status: 503 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, secret, source: "trisellr-waitlist" }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Webhook response: ${response.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "We could not save your email. Please try again." },
      { status: 502 }
    );
  }
}
