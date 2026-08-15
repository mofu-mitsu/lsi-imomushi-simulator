export interface CaterpillarData {
  ownerName: string;
  selfType: string;
  id: string;
  name: string;
  stage: number;
  exp: number;
  points: number;
  furniture: string[];
  discoveredStages: string[];
  lastFedAt: string;
  lastMessageAt: string;
  logs: { time: string; text: string }[];
  gasWebAppUrl: string;
  uid?: string;
  squashCount?: number;
  isSquashed?: boolean;
  sprayCount?: number;
  daycareUntil?: string | null;
  darlingIncident?: boolean;
  darlingMoodTarget?: number;
  foodStats?: {
    cabbage: number;
    apple: number;
    glucose: number;
  };
  evolutionBranch?: string;
}

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxkTSIew8Z9k5KqfDt4s_TqcfneQ7XilCLR-FWZSVWhZmk2Qzx5LASMmTKBzll5u0caiQ/exec';

export const DEFAULT_CATERPILLAR_DATA: CaterpillarData = {
  ownerName: '未設定',
  selfType: '未設定',
  id: '000001',
  name: 'LSI芋虫（幼虫）',
  stage: 0,
  exp: 0,
  points: 150, // Initial bonus points
  furniture: [],
  discoveredStages: ['LSI芋虫（幼虫）'],
  lastFedAt: '2026-08-15T00:00:00.000Z',
  lastMessageAt: '2026-08-15T00:00:00.000Z',
  logs: [
    { time: '09:00:00', text: '領域の境界線をミリ単位で点検・確保。' },
    { time: '08:00:00', text: 'エサの成分表示（タンパク質・脂質比率）を熟読。' }
  ],
  gasWebAppUrl: DEFAULT_GAS_URL,
  squashCount: 0,
  isSquashed: false,
  sprayCount: 0,
  daycareUntil: null,
  darlingIncident: false,
  darlingMoodTarget: 50
};

// Load status from user's Google Apps Script (GAS) Web App
export async function loadFromGas(
  gasUrl: string,
  uid?: string
): Promise<{ success: boolean; data?: Partial<CaterpillarData>; error?: string }> {
  const targetUrl = gasUrl || DEFAULT_GAS_URL;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { success: false, error: '有効なGAS WebアプリURLがありません' };
  }

  try {
    const url = new URL(targetUrl);
    url.searchParams.set('action', 'getUserStatus');
    if (uid) url.searchParams.set('uid', uid);

    const res = await fetch(url.toString(), {
      method: 'GET'
    });

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }

    const json = await res.json();
    if (json.success && json.data) {
      return { success: true, data: json.data };
    }
    return { success: false, error: json.error || 'データが見つかりません' };
  } catch (e: any) {
    console.error('GAS load error:', e);
    return { success: false, error: e.message };
  }
}

// Sync with user's Google Apps Script (GAS) Web App
export async function syncWithGas(
  gasUrl: string, 
  data: CaterpillarData
): Promise<{ success: boolean; message?: string; error?: string }> {
  const targetUrl = gasUrl || DEFAULT_GAS_URL;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { success: false, error: '有効なGAS WebアプリURLがありません' };
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8' // GAS accepts text/plain to prevent CORS preflight issues
      },
      body: JSON.stringify({
        action: 'saveStatus',
        data: {
          ownerName: data.ownerName,
          selfType: data.selfType,
          id: data.id,
          name: data.name,
          stage: data.stage,
          exp: data.exp,
          points: data.points,
          furniture: data.furniture,
          discoveredStages: data.discoveredStages || ['LSI芋虫（幼虫）'],
          lastFedAt: data.lastFedAt,
          lastMessageAt: data.lastMessageAt,
          uid: data.uid || ''
        }
      })
    });

    if (!res.ok) {
      return { success: false, error: `通信エラー: HTTP ${res.status}` };
    }

    const json = await res.json();
    return json;
  } catch (e: any) {
    console.error('GAS sync error:', e);
    return { success: false, error: e.message || '同期に失敗しました' };
  }
}

// Append log to GAS
export async function appendLogToGas(
  gasUrl: string,
  type: string,
  detail: string,
  expChange: number,
  uid?: string
): Promise<void> {
  const targetUrl = gasUrl || DEFAULT_GAS_URL;
  if (!targetUrl || !targetUrl.startsWith('http')) return;
  try {
    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'appendLog',
        type,
        detail,
        expChange,
        uid: uid || 'guest'
      })
    });
  } catch (e) {
    console.error('Failed to append log to GAS:', e);
  }
}

// Append chat to GAS
export async function appendChatToGas(
  gasUrl: string,
  sender: string,
  message: string,
  uid?: string
): Promise<void> {
  const targetUrl = gasUrl || DEFAULT_GAS_URL;
  if (!targetUrl || !targetUrl.startsWith('http')) return;
  try {
    await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'appendChat',
        sender,
        message,
        uid: uid || 'guest'
      })
    });
  } catch (e) {
    console.error('Failed to append chat to GAS:', e);
  }
}
