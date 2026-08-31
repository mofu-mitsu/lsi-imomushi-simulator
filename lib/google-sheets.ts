export interface CaterpillarData {
  ownerName: string;
  selfType: string;
  id: string;
  name: string;
  customName?: string;
  stage: number;
  exp: number;
  points: number;
  furniture: string[];
  equippedFurniture?: string[];
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
    sugar: number;
    twig: number;
  };
  formVariant?: string;
  evolutionBranch?: string;
  readAnnouncements?: string[];
}

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwhZhzNmO8yv_pS7eYchCzPyU4QwkHCapO4J8HXUwJ9z5XPUZEQLk0aFYEFGX1RrZsPqA/exec';

// Generate or retrieve unique guest UID per browser/device
export function getOrCreateGuestUid(): string {
  if (typeof window === 'undefined') return 'guest_default';
  try {
    const existing = localStorage.getItem('lsi_caterpillar_guest_uid');
    if (existing && existing.startsWith('guest_')) return existing;
    
    // Create random unique guest id: guest_TIMESTAMP_RANDOM
    const newUid = 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('lsi_caterpillar_guest_uid', newUid);
    return newUid;
  } catch {
    return 'guest_' + Date.now().toString(36);
  }
}

export const DEFAULT_CATERPILLAR_DATA: CaterpillarData = {
  ownerName: '未設定',
  selfType: '未設定',
  id: '000001',
  name: 'LSI芋虫（幼虫）',
  stage: 0,
  exp: 0,
  points: 150, // Initial bonus points
  furniture: [],
  equippedFurniture: [],
  discoveredStages: ['LSI芋虫（幼虫）'],
  lastFedAt: new Date().toISOString(),
  lastMessageAt: new Date().toISOString(),
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
  darlingMoodTarget: 50,
  foodStats: {
    cabbage: 0,
    apple: 0,
    glucose: 0,
    sugar: 0,
    twig: 0
  },
  formVariant: 'crystal',
  readAnnouncements: []
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

  const targetUid = uid || getOrCreateGuestUid();

  try {
    const url = new URL(targetUrl);
    url.searchParams.set('action', 'getUserStatus');
    url.searchParams.set('uid', targetUid);

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

  const targetUid = data.uid || getOrCreateGuestUid();

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
          customName: data.customName || '名無し',
          name: data.name || 'LSI芋虫（幼虫）',
          stage: data.stage,
          exp: data.exp,
          points: data.points,
          furniture: data.furniture,
          equippedFurniture: data.equippedFurniture || [],
          discoveredStages: data.discoveredStages || ['LSI芋虫（幼虫）'],
          lastFedAt: data.lastFedAt,
          lastMessageAt: data.lastMessageAt,
          uid: targetUid,
          sprayCount: data.sprayCount || 0,
          daycareUntil: data.daycareUntil || null,
          darlingIncident: data.darlingIncident || false,
          darlingMoodTarget: data.darlingMoodTarget || 50,
          foodStats: data.foodStats || { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 },
          formVariant: data.formVariant || 'crystal',
          squashCount: data.squashCount || 0,
          readAnnouncements: data.readAnnouncements || []
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
        uid: uid || getOrCreateGuestUid()
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
        uid: uid || getOrCreateGuestUid()
      })
    });
  } catch (e) {
    console.error('Failed to append chat to GAS:', e);
  }
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  content: string;
}

export async function fetchAnnouncementsFromGas(gasUrl: string): Promise<{ success: boolean; data?: Announcement[]; error?: string }> {
  const targetUrl = gasUrl || DEFAULT_GAS_URL;
  if (!targetUrl || !targetUrl.startsWith('http')) {
    return { success: false, error: '有効なGAS WebアプリURLがありません' };
  }
  
  try {
    const url = new URL(targetUrl);
    url.searchParams.set('action', 'getAnnouncements');
    
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
    return { success: false, error: json.error || 'お知らせの取得に失敗しました' };
  } catch (e: any) {
    console.error('GAS announcements load error:', e);
    return { success: false, error: e.message };
  }
}
