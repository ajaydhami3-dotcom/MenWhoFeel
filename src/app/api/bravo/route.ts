import { NextResponse } from "next/server";

// --- ENGINE 1: GEMINI 1.5 FLASH (PRIMARY) ---
async function callGemini(messages: any[], system: string) {
  // Convert standard messages to Gemini's specific format
  const geminiContents = messages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: geminiContents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
    }),
  });

  if (!response.ok) throw new Error("Gemini Engine Offline");
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// --- ENGINE 2: GROQ LLAMA-3.1 (BACKUP) ---
async function callGroq(messages: any[], system: string) {
  // Format for Groq: The system prompt goes first in the array
  const groqMessages = [
    { role: "system", content: system },
    ...messages
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: groqMessages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error("Groq Engine Offline");
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// --- THE ROUTER ---
export async function POST(req: Request) {
  try {
    const { messages, system } = await req.json();
    let replyText = "";

    try {
      // ATTEMPT 1: Primary Engine
      replyText = await callGemini(messages, system);
      console.log("Transmission Successful: Gemini Engine");
    } catch (geminiError) {
      console.warn("Gemini Engine failed. Rerouting to Groq...", geminiError);
      
      // ATTEMPT 2: Fallback Engine
      replyText = await callGroq(messages, system);
      console.log("Transmission Successful: Groq Engine");
    }

    // Return the response in the exact format the frontend expects
    return NextResponse.json({ content: [{ text: replyText }] });

  } catch (error) {
    // If BOTH free tiers fail, return a clean error to the user
    console.error("All Comms Engines Offline:", error);
    return NextResponse.json({ error: "Comms interrupted. All networks busy." }, { status: 500 });
  }
}