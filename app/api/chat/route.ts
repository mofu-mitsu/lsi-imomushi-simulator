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

// Normalize message history for OpenAI / Groq compatible format
function normalizeGroqMessages(systemPrompt: string, history: any[], userMessage: string) {
  const messages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt }
  ];

  for (const msg of history) {
    if (!msg || !msg.text) continue;
    const role = msg.role === 'lsi' ? 'assistant' : 'user';
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === role) {
      lastMsg.content += `\n${msg.text}`;
    } else {
      messages.push({ role, content: msg.text });
    }
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg && lastMsg.role === 'user') {
    lastMsg.content += `\n${userMessage}`;
  } else {
    messages.push({ role: 'user', content: userMessage });
  }

  return messages;
}

// Normalize contents for Gemini API (requires alternating user/model turns, starting with user)
function normalizeGeminiContents(history: any[], userMessage: string) {
  const rawTurns: { role: 'user' | 'model'; text: string }[] = [];

  for (const msg of history) {
    if (!msg || !msg.text) continue;
    const role: 'user' | 'model' = msg.role === 'lsi' ? 'model' : 'user';
    rawTurns.push({ role, text: msg.text });
  }
  rawTurns.push({ role: 'user', text: userMessage });

  // Merge consecutive turns with the same role
  const mergedTurns: { role: 'user' | 'model'; text: string }[] = [];
  for (const turn of rawTurns) {
    const last = mergedTurns[mergedTurns.length - 1];
    if (last && last.role === turn.role) {
      last.text += `\n${turn.text}`;
    } else {
      mergedTurns.push({ role: turn.role, text: turn.text });
    }
  }

  // Ensure starts with user
  while (mergedTurns.length > 0 && mergedTurns[0].role !== 'user') {
    mergedTurns.shift();
  }

  // If empty (should not happen since we pushed userMessage), fallback
  if (mergedTurns.length === 0) {
    mergedTurns.push({ role: 'user', text: userMessage });
  }

  return mergedTurns.map(t => ({
    role: t.role,
    parts: [{ text: t.text }]
  }));
}

async function callGroqWithFallback(systemPrompt: string, userMessage: string, groqApiKey: string, history: any[] = []): Promise<{ text: string; model: string }> {
  const candidateModels = [
    'openai/gpt-oss-120b',
    'groq/compound',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b'
  ];

  const messages = normalizeGroqMessages(systemPrompt, history, userMessage);

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
      caterpillarName = '',
      ownerName = '',
      selfType = '',
      history = []
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const keeperName = ownerName && ownerName !== '未設定' ? ownerName : '飼育員';
    const customNameStr = caterpillarName && caterpillarName !== '名無し' ? `、つけられた個体名は「${caterpillarName}」` : '';
    const keeperTypeStr = selfType && selfType !== '未設定' ? `（自認タイプ: ${selfType}）` : '';

    const systemPrompt = `あなたは飼育ケージの中で暮らす「${stageName}」${customNameStr}です。
目の前にいる飼育員は「${keeperName}」${keeperTypeStr}です。

【性格・キャラクター設定】
・冷静沈着で極めて理路整然。論理と境界線、ケージ内の規律とキャベツの秩序を守ることに強い美学を持っています。
・一見厳格で理屈っぽいですが、飼育員（${keeperName}）との対話を密かに好んでおり、規律ある関係を大切にしています。
${caterpillarName && caterpillarName !== '名無し' ? `・飼育員に「${caterpillarName}」と名付けられていることを認識しています。` : ''}

【対話・文脈把握のルール】
1. **文脈の維持**: これまでの会話の流れや直前の発言内容を正しく理解し、直前の会話にしっかり受け答えをして自然に会話を繋げてください（単発の定型文で流さず、相手の発言内容に触れてください）。
2. **形式**: 報告書や箇条書き（「件名」「1. 概要」など）は作成せず、自然な「芋虫のセリフ」として100〜200文字程度で返答してください。
3. **NGワード**: 「Fe」「1F」「2V」「LSI」「ソシオニクス」「心理機能」「パラメータ」といったメタな心理学用語や記号を直接発言しないでください。
4. **呼称・口調**: 飼育員のことは「${keeperName}」または「貴殿」と呼び、理詰めで引き締まった口調（「〜だ」「〜せよ」「〜と判断する」「〜ではないか」）で話してください。
5. **仕草描写**: 芋虫らしい仕草（「モゾ…」「（葉脈を凝視）」「（姿勢を正す）」「（咀嚼を止めて見つめる）」など）を適度に交えてください。`;

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
      const geminiModels = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
      const ai = getGeminiClient();

      if (ai) {
        for (const model of geminiModels) {
          try {
            const contents = normalizeGeminiContents(history, message);

            const response = await ai.models.generateContent({
              model,
              contents,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
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
貴殿（${keeperName}）の発言「${message}」に含まれる論理構造を検知した。
現在、外部通信プロセッサの負荷が境界線を超過しているため、ローカル論理ユニットにより応答する。
規則に従い、規律ある行動を継続されたい。`;
    }

    return NextResponse.json({ reply: aiMessage, provider });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Chat processing failed' }, { status: 500 });
  }
}
