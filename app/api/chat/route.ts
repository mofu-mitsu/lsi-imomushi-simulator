import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Strip thinking tags if models like Qwen return reasoning tokens
function cleanModelResponse(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

async function callGroqWithFallback(systemPrompt: string, userMessage: string, groqApiKey: string): Promise<{ text: string; model: string }> {
  const candidateModels = [
    'openai/gpt-oss-120b',
    'qwen/qwen3.6-27b',
    'groq/compound',
    'openai/gpt-oss-20b'
  ];

  for (const model of candidateModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        const cleaned = cleanModelResponse(rawContent);
        if (cleaned) {
          return { text: cleaned, model };
        }
      } else {
        const errText = await res.text();
        console.warn(`Groq model ${model} failed with status ${res.status}:`, errText);
      }
    } catch (e: any) {
      console.warn(`Groq model ${model} error:`, e?.message || e);
    }
  }

  throw new Error('All Groq candidate models failed');
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
    let provider = 'AI';

    // 1. Try Gemini with multi-model fallback
    const geminiModels = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    const ai = getGeminiClient();

    if (ai) {
      for (const model of geminiModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: message,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.8,
            },
          });
          const text = response.text?.trim() || '';
          if (text) {
            aiMessage = text;
            provider = `Gemini (${model})`;
            break;
          }
        } catch (e: any) {
          console.warn(`Gemini model ${model} attempt failed:`, e?.message || e);
        }
      }
    }

    // 2. Fallback to Groq if Gemini failed
    if (!aiMessage && process.env.GROQ_API_KEY) {
      try {
        const groqResult = await callGroqWithFallback(systemPrompt, message, process.env.GROQ_API_KEY);
        aiMessage = groqResult.text;
        provider = `Groq (${groqResult.model})`;
      } catch (e: any) {
        console.error('All Groq fallback attempts failed:', e?.message || e);
      }
    }

    // 3. Fallback mock only if both external providers fail
    if (!aiMessage) {
      provider = 'Local Logic Protocol';
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
