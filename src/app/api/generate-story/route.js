import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export async function POST(request) {
  try {
    const { isHotdog, labels } = await request.json();

    // Create a prompt based on the detetion results
    const prompt = isHotdog
      ? `Create a funny, dramatic story (max 1 paragraph) about a hotdog that is ${labels.map(
          (label) => label.description
        )}.`
      : `Create a funny, dramatic story (max 1 paragraph) about a (${labels
          .map((label) => label.description)
          .join(", ")}) is pretending to be a hotdog.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a witty story teller who creates dramatic, funny stories about hotdogs and food items, you are also a meme master that knows all up to date memes that you can talk about in the storys about how the hotdog can relate to it. Keep stories concise and humorous.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.6,
    });

    return NextResponse.json({
      story: completion.choices[0].message.content.trim(),
    });
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
