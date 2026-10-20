import { NextResponse } from "next/server";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

function onboardingReply(message: string, messages: ChatMessage[]) {
  const text = message.toLowerCase();
  const hasProducts = /sell|product|service|wig|dress|food|hair|price|₦|naira/.test(text);
  const hasChannels = /whatsapp|instagram|tiktok|website|store|physical|marketplace/.test(text);
  const hasPayments = /transfer|cash|card|payment link|mobile money/.test(text);

  if (hasPayments) {
    return "Thanks — I’ve noted those payment methods for this setup. Do you already have customers you want to bring into Trisellr, or would you rather add them later?";
  }

  if (hasChannels) {
    return "Great, I’ve noted those sales channels. How do your customers usually pay you — bank transfer, cash, card, payment link, or something else?";
  }

  if (hasProducts) {
    return "That’s helpful. I’ll keep those as draft details until you confirm them. Where do customers usually place their orders — WhatsApp, Instagram, a physical store, or somewhere else?";
  }

  if (messages.filter((item) => item.role === "user").length <= 1) {
    return "Thanks — I’m here to help set up your business workspace. What do you sell or what service do you provide?";
  }

  return "Got it. Tell me a little more about what you sell or the service you provide, and include prices if you already know them.";
}

export async function POST(request: Request) {
  const body = (await request.json()) as { message?: string; messages?: ChatMessage[] };
  const message = body.message?.trim();
  const messages = body.messages ?? [];

  if (!message) {
    return NextResponse.json({ error: "A message is required." }, { status: 400 });
  }

  return NextResponse.json({
    message: onboardingReply(message, messages),
    status: "draft"
  });
}
