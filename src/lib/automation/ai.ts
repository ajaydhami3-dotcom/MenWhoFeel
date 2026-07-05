/**
 * AI service for the automation pipeline — Gemini only.
 */

export interface AiCallOptions {
  system: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  json?: boolean;
  thinking?: boolean; // default false — thinking eats output tokens on 2.5-flash
}

export interface AiResult {
  text: string;
  durationMs: number;
}

// ─── Gemini ──────────────────────────────────────────────────────────────────

async function callGemini(options: AiCallOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = options.json
    ? `${options.system}\n\nIMPORTANT: Respond with valid JSON only. No markdown fences, no explanation, no preamble.`
    : options.system;

  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: options.prompt }] }],
    generationConfig: {
      maxOutputTokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.7,
      ...(options.json ? { responseMimeType: "application/json" } : {}),
      // Disable thinking by default — it silently consumes output tokens on
      // gemini-2.5-flash before producing any response, leaving too little
      // room for long structured JSON (e.g. full article content). Structured
      // generation tasks don't benefit from extended thinking anyway.
      ...(!options.thinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
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

// ─── Public API ──────────────────────────────────────────────────────────────

export async function callAi(options: AiCallOptions): Promise<AiResult> {
  const start = Date.now();
  const text = await callGemini(options);
  return { text, durationMs: Date.now() - start };
}

export async function callAiJson<T = unknown>(
  options: AiCallOptions
): Promise<{ data: T; durationMs: number }> {
  const result = await callAi({ ...options, json: true });

  const cleaned = result.text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return { data: JSON.parse(cleaned) as T, durationMs: result.durationMs };
  } catch {
    throw new Error(`Gemini returned invalid JSON:\n${cleaned.slice(0, 500)}`);
  }
}