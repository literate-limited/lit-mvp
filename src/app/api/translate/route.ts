import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, from = "fr", to = "en" } = await req.json();
  if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are a translator. Translate the following text from ${from} to ${to}. Return only the translation, no explanations.` },
        { role: "user", content: text },
      ],
    });

    const translation = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ translation });
  } catch (error) {
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
