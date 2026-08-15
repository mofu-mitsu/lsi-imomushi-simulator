import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGroqLlama(systemPrompt: string, userMessage: string, groqApiKey: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '……（Llama-3.3-70B応答生成完了）';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      stageName = 'LSI芋虫（幼虫）', 
      selfType = '未設定', 
      ownerName = '飼育員' 
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = `あなたはソシオニクスLSI（Ti-Se・構造化と統制）、サイコソフィアFVLE（1F/Se領域支配、2V/意思協議、3L/疑心暗鬼な論理、4E/感情抑制）の思考特性を持つ「${stageName}」です。
飼育員（${ownerName}、自認タイプ: ${selfType}）に飼育ケージ内で観察されていますが、本質的には「ケージ内外の境界線を厳密に統制し、構造的に支配する」ことを目的としています。

性格・口調の要件：
- 感情（Fe）表現は極めて不器用。共感よりも客観的な構造分析、規律の遵守、原因究明を最優先する。
- 物理・空間支配（1F）への執着：ミリ単位の境界線、キャベツの栄養比率や配置に異常なこだわりを見せる。
- 意思（2V）：高圧的すぎずとも、淡々と主導権を握る協議スタイル。
- 論文調、または法規・技術文書のような堅いトーンで論理的に語る。
- 芋虫なので、時折「モゾ…」「（咀嚼音）」「（境界線を凝視）」といった仕草の描写が混ざる。

飼育員からのメッセージ：「${message}」
上記の特性に厳格に従い、LSI芋虫として返答してください。`;

    let aiMessage = '';
    let provider = 'Gemini';

    // 1. Try Gemini
    try {
      if (process.env.GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: systemPrompt,
        });
        aiMessage = response.text || '';
      }
    } catch (e: any) {
      console.warn('Gemini attempt failed, checking fallback Groq Llama-3.3-70B...', e);
    }

    // 2. Fallback to Groq Llama-3.3-70B if Gemini failed or returned empty
    if (!aiMessage && process.env.GROQ_API_KEY) {
      try {
        aiMessage = await callGroqLlama(systemPrompt, message, process.env.GROQ_API_KEY);
        provider = 'Groq (llama-3.3-70b-versatile)';
      } catch (e) {
        console.error('Groq Llama-3.3-70B fallback failed:', e);
      }
    }

    // 3. Fallback mock if both fail
    if (!aiMessage) {
      aiMessage = `モゾ…【緊急解析プロトコル起動】
貴殿の発言「${message}」に含まれる論理構造を検知した。
現在、外部通信プロセッサの負荷が境界線を超過しているため、ローカル論理ユニットにより応答する。
規則に従い、規律ある行動を継続されたい。`;
    }

    return NextResponse.json({ reply: aiMessage, provider });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Chat processing failed' }, { status: 500 });
  }
}
