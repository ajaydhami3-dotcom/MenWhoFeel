/**
 * AI provider service for the automation pipeline.
 * Uses the same Gemini → Groq fallback pattern as /api/bravo/route.ts,
 * but purpose-built for structured JSON output and server-side pipeline use.
 */

export type AiProvider = "gemini" | "groq";

export interface AiCallOptions {
  system: string;
  prompt: string;
  provider?: AiProvider;
  maxTokens?: number;
  temperature?: number;
  json?: boolean; // if true, instructs the model to respond with JSON only
}

export interface AiResult {
  text: string;
  provider: AiProvider;
  durationMs: number;
}

// ─── Gemini ──────────────────────────────────────────────────────────────────

async function callGemini(options: AiCallOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const model = "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = options.json
    ? `${options.system}\n\nIMPORTANT: Respond with valid JSON only. No markdown fences, no explanation, no preamble.`
    : options.system;

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: options.prompt }] }],
    generationConfig: {
      maxOutputTokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.7,
      ...(options.json ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty content");
  return text;
}

// ─── Groq ────────────────────────────────────────────────────────────────────

async function callGroq(options: AiCallOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const systemPrompt = options.json
    ? `${options.system}\n\nIMPORTANT: Respond with valid JSON only. No markdown fences, no explanation, no preamble.`
    : options.system;

  const body = {
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: options.prompt },
    ],
    max_tokens: options.maxTokens ?? 2048,
    temperature: options.temperature ?? 0.7,
    ...(options.json ? { response_format: { type: "json_object" } } : {}),
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Groq ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty content");
  return text;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Calls the AI provider, falling back from Gemini → Groq automatically.
 * If `options.provider` is set to 'groq', skips Gemini entirely.
 */
export async function callAi(options: AiCallOptions): Promise<AiResult> {
  const start = Date.now();

  if (options.provider === "groq") {
    const text = await callGroq(options);
    return { text, provider: "groq", durationMs: Date.now() - start };
  }

  // Default: Gemini primary, Groq fallback
  try {
    const text = await callGemini(options);
    return { text, provider: "gemini", durationMs: Date.now() - start };
  } catch (geminiErr) {
    console.warn("[automation/ai] Gemini failed, falling back to Groq:", geminiErr);
    const text = await callGroq(options);
    return { text, provider: "groq", durationMs: Date.now() - start };
  }
}

/**
 * Like callAi but parses and returns JSON. Strips markdown fences if the
 * model included them despite instructions.
 */
export async function callAiJson<T = unknown>(options: AiCallOptions): Promise<{ data: T; provider: AiProvider; durationMs: number }> {
  const result = await callAi({ ...options, json: true });
  const cleaned = result.text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return { data: JSON.parse(cleaned) as T, provider: result.provider, durationMs: result.durationMs };
  } catch {
    throw new Error(`AI returned invalid JSON (provider: ${result.provider}):\n${cleaned.slice(0, 500)}`);
  }
}
