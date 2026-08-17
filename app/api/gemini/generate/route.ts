import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ 
        text: "モゾ…【オフライン論理プロセッサ】GEMINI_API_KEY未設定のためローカル応答を実行。" 
      });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const response = await ai.models.generateContent({
      model: model || "gemini-3.7-flash",
      contents: prompt,
    });
    return NextResponse.json({ text: response.text || "" });
  } catch (e: any) {
    console.error("Gemini generate error:", e);
    return NextResponse.json({ text: "モゾ…通信エラー。論理フレームを再構築中。" }, { status: 500 });
  }
}
