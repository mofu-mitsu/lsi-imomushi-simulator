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

// Strip thinking tags if models like Qwen or DeepSeek return reasoning tokens
function cleanModelResponse(text: string): string {
  return text.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '').trim();
}

async function callGroqWithFallback(systemPrompt: string, userMessage: string, groqApiKey: string, history: any[] = []): Promise<{ text: string; model: string }> {
  const candidateModels = [
    'openai/gpt-oss-120b',
    'groq/compound',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b'
  ];

  for (const model of candidateModels) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({ role: msg.role === 'lsi' ? 'assistant' : 'user', content: msg.text })),
        { role: 'user', content: userMessage }
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
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
      stageName = 'LSI芋虫',
      ownerName = '',
      history = []
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const keeperName = ownerName && ownerName !== '未設定' ? ownerName : '飼育員';

    const systemPrompt = `あなたは飼育ケージの中で暮らす「${stageName}」です。
冷静沈着で理路整然としており、ケージ内の規律・境界線・キャベツの葉脈の秩序を守ることに強いこだわりを持っています。

【対話の絶対ルール】
1. 報告書や箇条書きの文書（「件名」「1. 概要」など）を作らないでください。相手に向けた自然な「芋虫のセリフ」として100〜200文字程度で返答してください。
2. 「Fe」「1F」「2V」「LSI」「ソシオニクス」「心理機能」「パラメータ」といった専門用語・型記号を絶対に直接発言しないでください。
3. 相手のことは「${keeperName}」「貴殿」と呼び、冷静かつ理詰めの口調（「〜だ」「〜せよ」「〜と判断する」）で話してください。
4. 芋虫らしい仕草描写（「モゾ…」「（葉を咀嚼）」「（境界線を凝視）」など）を自然に交えてください。`;

    let aiMessage = '';
    let provider = 'AI';

    // 1. Try Groq first for ultra-fast LPU response speed
    if (process.env.GROQ_API_KEY) {
      try {
        const groqResult = await callGroqWithFallback(systemPrompt, message, process.env.GROQ_API_KEY, history);
        aiMessage = groqResult.text;
        provider = `Groq (${groqResult.model})`;
      } catch (e: any) {
        console.warn('Groq priority attempt failed, falling back to Gemini...', e?.message || e);
      }
    }

    // 2. Fallback to Gemini if Groq was unavailable or failed
    if (!aiMessage) {
      const geminiModels = ['gemini-3.1-flash-lite', 'gemini-3.7-flash', 'gemini-flash-latest'];
      const ai = getGeminiClient();

      if (ai) {
        for (const model of geminiModels) {
          try {
            const contents = [
              ...history.map((msg: any) => ({
                role: msg.role === 'lsi' ? 'model' : 'user',
                parts: [{ text: msg.text }]
              })),
              { role: 'user', parts: [{ text: message }] }
            ];

            const response = await ai.models.generateContent({
              model,
              contents,
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
