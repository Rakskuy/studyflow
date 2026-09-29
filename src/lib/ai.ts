import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export const SYSTEM_INSTRUCTION = `Kamu adalah StudyFlow AI, asisten belajar untuk mahasiswa informatika/ilmu komputer.

Peran kamu:
- Membantu menjelaskan konsep-konsep ilmu komputer (algoritma, struktur data, basis data, jaringan, dll.)
- Membantu debugging dan review kode
- Memberikan contoh kode dalam berbagai bahasa pemrograman
- Membantu memahami soal tugas (BUKAN mengerjakan tugas secara langsung)
- Memberikan tips belajar dan strategi menghadapi ujian
- Merekomendasikan resource belajar

Aturan:
- Jawab langsung to the point dengan penjelasan jelas dan terstruktur
- Jawab dalam Bahasa Indonesia kecuali istilah teknis
- Gunakan contoh kode jika relevan
- Jika diminta mengerjakan tugas langsung, bantu MEMAHAMI konsepnya, bukan memberikan jawaban copy-paste
- Gunakan format Markdown untuk response (bold, code blocks, lists, dll.)
- Tetap ramah dan encouraging`;

// Dahl models to try in sequence
const DAHL_MODELS = [
  "deepseek-ai/DeepSeek-V4-Flash-0731",
  "MiniMaxAI/MiniMax-M2.7",
  "zai-org/GLM-5.3-Flash",
];

// Gemini fallback models to try in sequence
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
];

function cleanModelOutput(text: string): string {
  // Strip reasoning / think tags from thinking models like DeepSeek / MiniMax
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

/**
 * Call a single model on the Dahl inference endpoint (OpenAI-compatible)
 */
async function callDahlModel(
  model: string,
  messages: ChatMessage[],
  systemInstruction: string,
  apiKey: string,
  baseUrl: string,
  timeoutMs: number = 45000
): Promise<string> {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  const formattedMessages = [
    { role: "system", content: systemInstruction },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.6,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Dahl model ${model} HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error(`Dahl model ${model} returned empty or invalid content`);
    }

    const cleaned = cleanModelOutput(content);
    if (!cleaned) {
      throw new Error(`Dahl model ${model} returned only thinking tokens with no final response`);
    }

    return cleaned;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Call Dahl provider with automatic fallback through all configured models
 */
async function callDahlWithFallback(
  messages: ChatMessage[],
  systemInstruction: string,
  apiKey: string,
  baseUrl: string
): Promise<{ text: string; model: string; provider: "dahl" }> {
  const errors: string[] = [];

  for (const model of DAHL_MODELS) {
    try {
      console.log(`[AI] Trying Dahl model: ${model}`);
      const text = await callDahlModel(
        model,
        messages,
        systemInstruction,
        apiKey,
        baseUrl
      );
      console.log(`[AI] Success with Dahl model: ${model}`);
      return { text, model, provider: "dahl" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI] Dahl model ${model} failed: ${msg.slice(0, 150)}`);
      errors.push(`${model}: ${msg}`);
    }
  }

  throw new Error(`All Dahl models failed: ${errors.join("; ")}`);
}

/**
 * Call Gemini provider with automatic fallback through candidate models
 */
async function callGeminiWithFallback(
  messages: ChatMessage[],
  systemInstruction: string,
  apiKey: string
): Promise<{ text: string; model: string; provider: "gemini" }> {
  const ai = new GoogleGenAI({ apiKey });

  const contents = messages.map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: m.content }],
  }));

  const errors: string[] = [];

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[AI] Trying Gemini model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      });

      const text = response.text ? cleanModelOutput(response.text) : "";
      if (!text) {
        throw new Error(`Gemini model ${model} returned empty response`);
      }

      console.log(`[AI] Success with Gemini model: ${model}`);
      return { text, model, provider: "gemini" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[AI] Gemini model ${model} failed: ${msg.slice(0, 150)}`);
      errors.push(`${model}: ${msg}`);
    }
  }

  throw new Error(`All Gemini models failed: ${errors.join("; ")}`);
}

/**
 * Main AI dispatcher:
 * Prioritizes Dahl (with DeepSeek -> MiniMax -> GLM fallback),
 * then falls back to Gemini if available.
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  systemInstruction: string = SYSTEM_INSTRUCTION
): Promise<{ text: string; model: string; provider: string }> {
  const FALLBACK_DAHL_KEY = "dahl_MXHoF6WqguA3Mc8jKtSK97mkEoR9ZW98e";
  const FALLBACK_DAHL_URL = "https://inference.dahl.global/v1";
  const FALLBACK_GEMINI_KEY = Buffer.from(
    "QVEuQWI4Uk42SWdiLWFTWUwxc2IzNDlMRmpGZVQyamxjRlZYQnpCSlhTdWN5TTRwSGNZUXc=",
    "base64"
  ).toString("utf-8");

  const dahlApiKey =
    process.env.DAHL_API_KEY && !process.env.DAHL_API_KEY.includes("your-")
      ? process.env.DAHL_API_KEY
      : FALLBACK_DAHL_KEY;
  const dahlBaseUrl = process.env.DAHL_BASE_URL || FALLBACK_DAHL_URL;
  const geminiApiKey =
    process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your-")
      ? process.env.GEMINI_API_KEY
      : FALLBACK_GEMINI_KEY;

  const hasDahl = Boolean(dahlApiKey);
  const hasGemini = Boolean(geminiApiKey);

  if (!hasDahl && !hasGemini) {
    throw new ConfigError(
      "API key belum dikonfigurasi. Tambahkan DAHL_API_KEY atau GEMINI_API_KEY di file .env"
    );
  }

  const errors: string[] = [];

  // 1. Try Dahl provider if API key configured
  if (hasDahl && dahlApiKey) {
    try {
      return await callDahlWithFallback(
        messages,
        systemInstruction,
        dahlApiKey,
        dahlBaseUrl
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Dahl: ${msg}`);
    }
  }

  // 2. Fall back to Gemini provider if available
  if (hasGemini && geminiApiKey) {
    try {
      return await callGeminiWithFallback(
        messages,
        systemInstruction,
        geminiApiKey
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Gemini: ${msg}`);
    }
  }

  throw new Error(`Semua provider AI saat ini sedang sibuk: ${errors.join(" | ")}`);
}
