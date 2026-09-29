import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateChatResponse, ChatMessage, ConfigError } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Build chat message history
    const messages: ChatMessage[] = [];

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg && typeof msg.content === "string") {
          messages.push({
            role: msg.role === "assistant" ? "assistant" : "user",
            content: msg.content,
          });
        }
      }
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    const result = await generateChatResponse(messages);

    return NextResponse.json({
      response: result.text,
      model: result.model,
      provider: result.provider,
    });
  } catch (error) {
    console.error("AI Chat error:", error);

    if (error instanceof ConfigError) {
      return NextResponse.json(
        {
          error:
            "API key belum dikonfigurasi. Periksa DAHL_API_KEY atau GEMINI_API_KEY di file .env",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Semua provider AI saat ini sedang sibuk (kapasitas penuh / timeout). Mohon tunggu sejenak dan klik tombol kirim lagi.",
      },
      { status: 503 }
    );
  }
}
