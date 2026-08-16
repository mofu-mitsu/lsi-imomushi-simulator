'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bug, 
  Gamepad2, 
  Eye, 
  Store, 
  Coins, 
  UserCheck, 
  LogIn, 
  LogOut, 
  Share2, 
  Check, 
  Edit3, 
  RotateCcw, 
  Clock, 
  Send,
  BookOpen,
  Settings,
  Sparkles,
  Award,
  ShieldCheck,
  ChevronRight,
  X,
  HelpCircle,
  Wind,
  Home,
  ShieldAlert,
  AlertTriangle,
  Menu,
  Calendar,
  Save,
  RefreshCw
} from 'lucide-react';
import CaterpillarRoom, { AVAILABLE_FURNITURE, DAILY_SCHEDULE, getCurrentSchedule, FurnitureItem, isSleepingTime } from './CaterpillarRoom';
import MiniGames from './MiniGames';
import ChrysalisSVG from './ChrysalisSVG';
import { 
  CaterpillarData, 
  DEFAULT_CATERPILLAR_DATA, 
  DEFAULT_GAS_URL,
  loadFromGas,
  syncWithGas, 
  appendLogToGas, 
  appendChatToGas,
  getOrCreateGuestUid
} from '@/lib/google-sheets';
import { auth, googleAuthProvider } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

export interface StageInfo {
  stageNumber: number;
  name: string;
  badge: string;
  threshold: number;
  desc: string;
  visual: string;
  disciplineTitle: string;
  flavorQuote: string;
  hint: string;
  category?: 'Ti' | 'Se' | 'Ne' | 'Fe' | 'Basic';
  chrysalisVariant?: 'crystal' | 'steel' | 'cyber' | 'gold';
}

export const ALL_ENCYCLOPEDIA_STAGES: StageInfo[] = [
  // Stage 0
  { 
    stageNumber: 0,
    name: 'LSI芋虫（幼虫）', 
    badge: 'STAGE 0', 
    threshold: 0, 
    desc: '境界線をミリ単位で確認し、テリトリーの規律を監視している基本幼虫。',
    visual: '🐛',
    disciplineTitle: '【初期段階】不可侵領土の確保と境界線監査',
    flavorQuote: '「ミリ単位の狂いも許さん。ここが我が不可侵領土だ」',
    hint: '最初から解放されています。',
    category: 'Basic'
  },
  // Stage 1
  { 
    stageNumber: 1,
    name: '規律の幼虫・課長級', 
    badge: 'STAGE 1 (Ti)', 
    threshold: 100, 
    desc: '毎朝の構造化目標を強制提示し、エサの消化ペースを厳格に指示する組織統制型幼虫。',
    visual: '🐛',
    disciplineTitle: '【物理統制】Se空間支配と消化ノルマ厳守',
    flavorQuote: '「モゾ……朝会プロトコル開始。本日の消化ノルマを厳格に履行せよ」',
    hint: 'EXP 100達成（リンゴ・小枝多めで進化）',
    category: 'Ti'
  },
  { 
    stageNumber: 1,
    name: '警戒索敵幼虫（Se物理強化型）', 
    badge: 'STAGE 1 (Se)', 
    threshold: 100, 
    desc: 'ケージ外の微細な振動を感知し、外骨格の防衛反応を高めた肉体派幼虫。',
    visual: '🐛',
    disciplineTitle: '【物理警戒】外向感覚（Se）による侵入即時察知',
    flavorQuote: '「0.1ミリの地響きも感知した。外敵の気配を逃さない」',
    hint: 'EXP 100達成（キャベツ多めで進化）',
    category: 'Se'
  },
  // Stage 2
  { 
    stageNumber: 2,
    name: '法務統制芋虫（Ti-Se監査型）', 
    badge: 'STAGE 2 (Ti)', 
    threshold: 250, 
    desc: '飼育員のクリック頻度・マウス軌跡を暗号化監査し、利用規約違反を摘発する法務特化幼虫。',
    visual: '🐛',
    disciplineTitle: '【法務統制】ケージ規約第142条の厳格運用と行動ログ暗号化',
    flavorQuote: '「飼育員の全操作ログをハッシュ化して保管中だ。規約違反は即座に摘発する」',
    hint: 'EXP 250達成（高純度リンゴ果汁・小枝重視）',
    category: 'Ti'
  },
  { 
    stageNumber: 2,
    name: '重装甲ガーディアン芋虫（物理防壁特化型）', 
    badge: 'STAGE 2 (Se)', 
    threshold: 250, 
    desc: '外殻に高密度キチン質を何層にも重ね、タップ圧力への耐性を極限まで高めた幼虫。',
    visual: '🐛',
    disciplineTitle: '【重装防壁】キチン質多層装甲による絶対防御態勢',
    flavorQuote: '「いかなる物理圧力も、我が重装甲の前には無力である」',
    hint: 'EXP 250達成（有機キャベツ重視）',
    category: 'Se'
  },
  { 
    stageNumber: 2,
    name: '電脳分析幼虫（多次元論理型）', 
    badge: 'STAGE 2 (Ne)', 
    threshold: 250, 
    desc: '合成グルコースの即効性により脳波をオーバークロックしたサイバー幼虫。',
    visual: '🐛',
    disciplineTitle: '【電脳解析】即効性グルコースによる思考演算周波数最大化',
    flavorQuote: '「毎秒10万通りの空間最適化ルートをシミュレーション中だ」',
    hint: 'EXP 250達成（合成グルコース重視）',
    category: 'Ne'
  },
  { 
    stageNumber: 2,
    name: '情緒監査幼虫（4E中和調和型）', 
    badge: 'STAGE 2 (Fe)', 
    threshold: 250, 
    desc: '角砂糖を摂取し、脆弱な感情反応（4E）を冷徹な論理で中和・飼い慣らした幼虫。',
    visual: '🐛',
    disciplineTitle: '【情動統御】微量糖分による劣等Feの鎮静化と調和',
    flavorQuote: '「感情のゆらぎは観測されたが、直ちに論理係数で相殺した」',
    hint: 'EXP 250達成（角砂糖重視）',
    category: 'Fe'
  },
  // Stage 3
  { 
    stageNumber: 3,
    name: '直角幾何学エリート青虫', 
    badge: 'STAGE 3 (Ti)', 
    threshold: 450, 
    desc: '全方向の空間座標を完全な直角と直線で再定義し、外骨格の強度を極限まで高めた精鋭幼虫。',
    visual: '🐛',
    disciplineTitle: '【空間幾何】直角グリッドによる領域完全制圧と骨格強化',
    flavorQuote: '「歪みは分子レベルで排除された。完全なる直角幾何学の歩行を見よ」',
    hint: 'EXP 450達成（Ti論理系統）',
    category: 'Ti'
  },
  { 
    stageNumber: 3,
    name: '領域制圧エリート芋虫（Se掌握型）', 
    badge: 'STAGE 3 (Se)', 
    threshold: 450, 
    desc: 'ケージ全域に不可侵の物理プレッシャーを展開し、あらゆる侵入者を威嚇する歴戦幼虫。',
    visual: '🐛',
    disciplineTitle: '【領域制圧】Se物理威圧による絶対防衛境界線の構築',
    flavorQuote: '「我が足跡こそが領土の掟。一歩たりとも踏み込ませぬ」',
    hint: 'EXP 450達成（Se物理系統）',
    category: 'Se'
  },
  { 
    stageNumber: 3,
    name: '多次元座標掌握幼虫（電脳ネットワーク型）', 
    badge: 'STAGE 3 (Ne)', 
    threshold: 450, 
    desc: 'ケージ内の3次元空間を多次元グリッドに変換し、瞬時に最適解へ移動する幼虫。',
    visual: '🐛',
    disciplineTitle: '【空間跳躍】多次元座標による動線無駄のゼロ化',
    flavorQuote: '「点と点を最短で結ぶ。無駄な軌跡は存在しない」',
    hint: 'EXP 450達成（Ne電脳系統）',
    category: 'Ne'
  },
  { 
    stageNumber: 3,
    name: '黄金比率バランサー幼虫（完全均衡型）', 
    badge: 'STAGE 3 (Fe)', 
    threshold: 450, 
    desc: 'あらゆる物理バランスと精神安定性を黄金比率（1:1.618）に調律した幼虫。',
    visual: '🐛',
    disciplineTitle: '【完全均衡】黄金分割比による骨格とメンタルの完全同期',
    flavorQuote: '「完全なる美と規律は黄金比の中にのみ宿る」',
    hint: 'EXP 450達成（Fe調和系統）',
    category: 'Fe'
  },
  // Stage 4 (Chrysalis - SVG)
  { 
    stageNumber: 4,
    name: '立方体クリスタルさなぎ（完全防壁シェルター）', 
    badge: 'STAGE 4 💎', 
    threshold: 700, 
    desc: '外殻を青く輝く多面体水晶で固めた不可侵の繭。内部で蝶への論理構造の超圧縮再構築を行う。',
    visual: '💎',
    disciplineTitle: '【要塞蛹化】不可侵シェルターによる完全防衛と内部構造化',
    flavorQuote: '「外部のノイズは全て遮断した。我が繭は難攻不落の水晶要塞である」',
    hint: 'EXP 700達成（Ti論理結晶型・SVGさなぎ）',
    category: 'Ti',
    chrysalisVariant: 'crystal'
  },
  { 
    stageNumber: 4,
    name: '鋼鉄要塞シェルターさなぎ（不可侵装甲繭）', 
    badge: 'STAGE 4 🛡️', 
    threshold: 700, 
    desc: '高密度チタン合金と六角形ハニカム装甲で固められた要塞型さなぎ。物理耐性MAX。',
    visual: '🛡️',
    disciplineTitle: '【鋼鉄要塞】重装甲ハニカムシールドによる絶対物理防護',
    flavorQuote: '「核の衝撃すら弾き返す。これが我が究極の物理装甲繭だ」',
    hint: 'EXP 700達成（Se物理装甲型・SVGさなぎ）',
    category: 'Se',
    chrysalisVariant: 'steel'
  },
  { 
    stageNumber: 4,
    name: '生体サイバー蛹（電脳回路繭）', 
    badge: 'STAGE 4 ⚡', 
    threshold: 700, 
    desc: 'ネオンエメラルドの回路パターンが脈動するサイバネティクス繭。羽化データを高速コンパイル中。',
    visual: '⚡',
    disciplineTitle: '【電脳変態】超並列データ処理による完全形態コンパイル',
    flavorQuote: '「コンパイル進行率98.7%……完全なる成虫プロトコルを展開中」',
    hint: 'EXP 700達成（Ne電脳回路型・SVGさなぎ）',
    category: 'Ne',
    chrysalisVariant: 'cyber'
  },
  { 
    stageNumber: 4,
    name: '黄金幾何学蛹（黄金比率ピラミッド）', 
    badge: 'STAGE 4 ✨', 
    threshold: 700, 
    desc: '神聖幾何学と黄金比率で構築された金色のピラミッド型さなぎ。神聖な規律の光を放つ。',
    visual: '✨',
    disciplineTitle: '【神聖幾何】黄金比ピラミッドによる完全調和変態',
    flavorQuote: '「黄金の光の中で、混沌は完全な秩序へと昇華される」',
    hint: 'EXP 700達成（Fe黄金調和型・SVGさなぎ）',
    category: 'Fe',
    chrysalisVariant: 'gold'
  },
  // Stage 5 (Fully Emerged Butterfly)
  { 
    stageNumber: 5,
    name: '構造化LSI完全体（領域展開・絶対秩序蝶）', 
    badge: 'MAX 🦋(Ti)', 
    threshold: 1000, 
    desc: '領域展開完了。ケージの概念を超越した完全な論理と物理の統制蝶へ羽化した。',
    visual: '🦋',
    disciplineTitle: '【完全羽化】絶対的論理空間の構築と普遍的秩序展開',
    flavorQuote: '「領域展開。ケージの境界線は今や全世界へと拡張された」',
    hint: 'EXP 1000達成（Ti論理の頂点）',
    category: 'Ti'
  },
  { 
    stageNumber: 5,
    name: '鋼鉄要塞カイザーアゲハ（重力支配・絶対物理蝶）', 
    badge: 'MAX 🦋(Se)', 
    threshold: 1000, 
    desc: '鋼鉄の羽ばたきで重力場を歪め、空間の全物理法則を支配する覇王蝶。',
    visual: '🦋',
    disciplineTitle: '【重力掌握】物理空間完全制覇とカイザーブレード羽ばたき',
    flavorQuote: '「我が羽の軌跡が世界の重心を定める。頭を垂れよ」',
    hint: 'EXP 1000達成（Se物理の頂点）',
    category: 'Se'
  },
  { 
    stageNumber: 5,
    name: '電脳サイバーモルフォ（多次元空間統制蝶）', 
    badge: 'MAX 🦋(Ne)', 
    threshold: 1000, 
    desc: '光ファイバーの翅を持ち、現実とデジタル空間の境界線を統御するサイバー蝶。',
    visual: '🦋',
    disciplineTitle: '【次元超越】デジタルとリアルの完全統合ネットワーク支配',
    flavorQuote: '「0と1の海を舞う。あらゆるバグは私の羽ばたきで消滅する」',
    hint: 'EXP 1000達成（Ne電脳の頂点）',
    category: 'Ne'
  },
  { 
    stageNumber: 5,
    name: '黄金調和アゲハ（黄金比率・完全秩序蝶）', 
    badge: 'MAX 🦋(Fe)', 
    threshold: 1000, 
    desc: '黄金の燐光を放ち、周囲のあらゆる不協和音と混乱を完全な美と静寂へ調和させる蝶。',
    visual: '🦋',
    disciplineTitle: '【黄金調和】全宇宙の不協和音を中和する絶対的安寧の展開',
    flavorQuote: '「すべては調和された。乱れなき静寂の美をここに永遠とせよ」',
    hint: 'EXP 1000達成（Fe調和の頂点）',
    category: 'Fe'
  }
];

export function getFormStageInfo(exp: number, foodStats?: CaterpillarData['foodStats']): { stageInfo: StageInfo; stageIdx: number; formVariant: string } {
  const c = foodStats || { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 };
  const tiScore = (c.apple || 0) * 1.5 + (c.twig || 0) * 2;
  const seScore = (c.cabbage || 0) * 2;
  const neScore = (c.glucose || 0) * 2.5;
  const feScore = (c.sugar || 0) * 2.2;

  let dominantCategory: 'Ti' | 'Se' | 'Ne' | 'Fe' = 'Ti';
  const maxScore = Math.max(tiScore, seScore, neScore, feScore);
  if (maxScore === seScore && seScore > 0) dominantCategory = 'Se';
  else if (maxScore === neScore && neScore > 0) dominantCategory = 'Ne';
  else if (maxScore === feScore && feScore > 0) dominantCategory = 'Fe';

  let stageIdx = 0;
  if (exp >= 1000) stageIdx = 5;
  else if (exp >= 700) stageIdx = 4;
  else if (exp >= 450) stageIdx = 3;
  else if (exp >= 250) stageIdx = 2;
  else if (exp >= 100) stageIdx = 1;

  let formVariant: 'crystal' | 'steel' | 'cyber' | 'gold' = 'crystal';
  if (dominantCategory === 'Se') formVariant = 'steel';
  else if (dominantCategory === 'Ne') formVariant = 'cyber';
  else if (dominantCategory === 'Fe') formVariant = 'gold';

  const matches = ALL_ENCYCLOPEDIA_STAGES.filter(s => s.stageNumber === stageIdx);
  const matched = matches.find(s => s.category === dominantCategory) || matches[0] || ALL_ENCYCLOPEDIA_STAGES[0];

  return { stageInfo: matched, stageIdx, formVariant };
}

export const STAGES = ALL_ENCYCLOPEDIA_STAGES;

export const CLERK_QUOTES = [
  '「いらっしゃいませ。アイテムの購入におけるコストパフォーマンスと要因分解をお手伝いします。」',
  '「いらっしゃいませ。当店の商品は全てJIS規格およびLSI統制基準を満たしております。規律ある設備投資をご検討ください。」',
  '「無計画な消費はエントロピーを増大させます。必要な設備のみを厳格に調達してください。」',
  '「防虫スプレーの有効成分は高純度Ti論理結晶です。突発的な感情要求を物理的にシャットアウトします。」',
  '「当店の商品はすべて空間占有率と心理的安定度の相関関係を検証済みです。」',
  '「購入前に『利用規約第88条（設備の減価償却）』をご一読いただくことを推奨します。」'
];

export const getClerkInsufficientFundsQuote = (itemName: string, cost: number, currentPoints: number): string => {
  const diff = Math.max(0, cost - currentPoints);
  const quotes = [
    `「『${itemName}』の購入資金が不足しています。必要ポイントは ${cost}pt（不足: ${diff}pt）です。」`,
    `「お客様、資金（ポイント）が不足しております。現在の保有ポイントは ${currentPoints}pt、必要額は ${cost}pt です。訓練シミュレータにて規律ポイントを補填してください。」`,
    '「冷やかしですか？ 購買意思決定プロセスのボトルネックを特定しましょうか。」',
    '「……閲覧のみですか。空間の占有率に対して購買行動が発生しない内部要因を分析してもいいですか？」',
    `「『${itemName}』への投資判断は妥当ですが、残高（${currentPoints}pt）が調達コスト（${cost}pt）を満たしていません。」`,
    '「予算超過を検知。感情的な衝動買いを防止するため、まずは訓練による自己規律の向上を命じます。」'
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

const LOCAL_STORAGE_KEY = 'lsi_caterpillar_data_v8';

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function Dashboard() {
  const mounted = useIsClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'observation' | 'shop' | 'training' | 'chat'>('status');
  
  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEncyclopediaOpen, setIsEncyclopediaOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Editing profile temporary states
  const [tempName, setTempName] = useState('');
  const [tempType, setTempType] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'lsi'; text: string; provider?: string }[]>([
    { role: 'lsi', text: '……システム起動完了。個体識別：LSI芋虫。環境の構造解析および境界線点検を開始する。' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // Evolution notice
  const [evolutionNotice, setEvolutionNotice] = useState<StageInfo | null>(null);

  // Shop clerk dialogue state
  const [clerkQuote, setClerkQuote] = useState(CLERK_QUOTES[0]);

  const rollClerkQuote = useCallback(() => {
    const random = CLERK_QUOTES[Math.floor(Math.random() * CLERK_QUOTES.length)];
    setClerkQuote(random);
  }, []);

  // Safe initial local data fetcher
  const [data, setData] = useState<CaterpillarData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const guestUid = getOrCreateGuestUid();
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const exp = typeof parsed.exp === 'number' ? parsed.exp : 0;
          const { stageInfo, stageIdx, formVariant } = getFormStageInfo(exp, parsed.foodStats);
          const discovered = Array.from(new Set([...(parsed.discoveredStages || []), stageInfo.name]));
          
          return {
            ...DEFAULT_CATERPILLAR_DATA,
            ...parsed,
            name: stageInfo.name,
            stage: stageIdx,
            formVariant: formVariant,
            gasWebAppUrl: DEFAULT_GAS_URL,
            uid: parsed.uid || guestUid,
            points: parsed.points !== undefined ? parsed.points : 150,
            furniture: parsed.furniture || [],
            discoveredStages: discovered,
            sprayCount: parsed.sprayCount !== undefined ? parsed.sprayCount : 0,
            daycareUntil: parsed.daycareUntil || null,
            darlingIncident: parsed.darlingIncident || false,
            darlingMoodTarget: parsed.darlingMoodTarget || (Math.floor(Math.random() * 990) + 10) / 10,
            foodStats: parsed.foodStats || { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }
          };
        }
        return {
          ...DEFAULT_CATERPILLAR_DATA,
          uid: guestUid
        };
      } catch (e) {
        console.error('Failed to load initial storage:', e);
      }
    }
    return DEFAULT_CATERPILLAR_DATA;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [data, mounted]);

  // Check 3-day inactivity (72 hours) for Darling-chan incident (No incident during sleep hours 23:00 - 07:00)
  useEffect(() => {
    if (!mounted) return;
    const timeoutId = setTimeout(() => {
      const now = Date.now();
      const lastActivityRaw = data.lastFedAt || data.lastMessageAt;
      
      // If never fed or no valid activity timestamp recorded yet, don't trigger incident
      if (!lastActivityRaw) return;
      
      const lastActivity = new Date(lastActivityRaw).getTime();
      if (isNaN(lastActivity) || lastActivity <= 0) return;

      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

      // Check if daycare is currently active or sleep time
      const isDaycareActive = data.daycareUntil && new Date(data.daycareUntil).getTime() > now;
      const isCurrentlySleep = isSleepingTime();

      if (!isDaycareActive && !isCurrentlySleep && (now - lastActivity > threeDaysMs) && !data.darlingIncident) {
        setData(prev => ({
          ...prev,
          darlingIncident: true,
          darlingMoodTarget: (Math.floor(Math.random() * 990) + 10) / 10,
          logs: [
            { time: new Date().toLocaleTimeString(), text: '🚨【物理崩壊インシデント】放置されたため、ILIダーリンちゃんにケージを占拠された！' },
            ...prev.logs.slice(0, 19)
          ]
        }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [mounted, data.lastFedAt, data.lastMessageAt, data.daycareUntil, data.darlingIncident]);

  // Auth state change & Automatic multi-account GAS synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setSyncStatus('syncing');
        try {
          const res = await loadFromGas(DEFAULT_GAS_URL, user.uid);
          if (res.success && res.data) {
            const fetched = res.data;
            const exp = typeof fetched.exp === 'number' ? fetched.exp : 0;
            const foodStats = fetched.foodStats || { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 };
            const { stageInfo, stageIdx, formVariant } = getFormStageInfo(exp, foodStats);
            const discovered = Array.from(new Set([...(fetched.discoveredStages || []), stageInfo.name]));

            setData(prev => ({
              ...prev,
              ...fetched,
              name: stageInfo.name,
              stage: stageIdx,
              formVariant: fetched.formVariant || formVariant,
              discoveredStages: discovered,
              uid: user.uid,
              ownerName: fetched.ownerName || (user.displayName || '飼育員'),
              gasWebAppUrl: DEFAULT_GAS_URL,
              sprayCount: fetched.sprayCount !== undefined ? fetched.sprayCount : (prev.sprayCount || 0),
              daycareUntil: fetched.daycareUntil !== undefined ? fetched.daycareUntil : prev.daycareUntil,
              darlingIncident: fetched.darlingIncident !== undefined ? fetched.darlingIncident : prev.darlingIncident,
              darlingMoodTarget: fetched.darlingMoodTarget || prev.darlingMoodTarget,
              foodStats: foodStats,
              squashCount: fetched.squashCount !== undefined ? fetched.squashCount : (prev.squashCount || 0)
            }));
            setSyncStatus('synced');
          } else {
            setData(prev => ({
              ...prev,
              uid: user.uid,
              ownerName: prev.ownerName === '未設定' ? (user.displayName || '飼育員') : prev.ownerName
            }));
            setSyncStatus('idle');
          }
        } catch (e) {
          console.error('Failed to auto-load from GAS:', e);
          setSyncStatus('error');
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync to GAS Helper
  const triggerGasSync = useCallback(async (currentData: CaterpillarData) => {
    setSyncStatus('syncing');
    try {
      const res = await syncWithGas(DEFAULT_GAS_URL, currentData);
      const nowStr = new Date().toLocaleTimeString();
      setLastSavedTime(nowStr);
      if (res.success) {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, []);

  // Manual Save (Immediate Local + Cloud Persistence)
  const handleManualSave = useCallback(async () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    const nowStr = new Date().toLocaleTimeString();

    // 1. Force LocalStorage save
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Manual local save error:', e);
    }

    // 2. Cloud Sync to GAS / Spreadsheet
    try {
      const res = await syncWithGas(DEFAULT_GAS_URL, data);
      setLastSavedTime(nowStr);
      if (res.success) {
        setSyncStatus('synced');
        setSaveToast(`✅ クラウド & ブラウザに保存完了 (${nowStr})`);
        setTimeout(() => {
          setSyncStatus('idle');
          setSaveToast(null);
        }, 3500);
      } else {
        setSyncStatus('synced');
        setSaveToast(`ℹ️ ローカル保存完了 (クラウド: 通信待機中)`);
        setTimeout(() => {
          setSyncStatus('idle');
          setSaveToast(null);
        }, 3500);
      }
    } catch {
      setSyncStatus('error');
      setSaveToast('⚠️ クラウド保存で通信エラー（ローカルには保存完了）');
      setTimeout(() => {
        setSyncStatus('idle');
        setSaveToast(null);
      }, 3500);
    }
  }, [data, syncStatus]);

  // Google Sign In
  const handleGoogleLogin = async () => {
    try {
      setAuthErrorMsg(null);
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      if (user) {
        const res = await loadFromGas(DEFAULT_GAS_URL, user.uid);
        if (res.success && res.data) {
          const fetched = res.data;
          const exp = typeof fetched.exp === 'number' ? fetched.exp : 0;
          const stageIdx = STAGES.reduce((acc, stage, idx) => exp >= stage.threshold ? idx : acc, 0);
          const stageInfo = STAGES[stageIdx];
          const discovered = Array.from(new Set([...(fetched.discoveredStages || []), stageInfo.name]));

          const updated = {
            ...DEFAULT_CATERPILLAR_DATA,
            ...fetched,
            name: stageInfo.name,
            stage: stageIdx,
            discoveredStages: discovered,
            uid: user.uid,
            ownerName: fetched.ownerName || user.displayName || '飼育員',
            gasWebAppUrl: DEFAULT_GAS_URL
          };
          setData(updated);
        } else {
          setData(prev => {
            const updated = {
              ...prev,
              uid: user.uid,
              ownerName: prev.ownerName === '未設定' ? (user.displayName || '飼育員') : prev.ownerName
            };
            triggerGasSync(updated);
            return updated;
          });
        }
      }
    } catch (e: any) {
      console.error('Google login error:', e);
      if (e?.code === 'auth/unauthorized-domain') {
        setAuthErrorMsg('※ 現在のドメインはFirebase認証の承認リスト外です。ローカルストレージ保存モードにて全機能をご利用いただけます。');
      } else {
        setAuthErrorMsg('ログイン処理で問題が発生しました。ローカル保存モードで遊べます。');
      }
    }
  };

  // Google Sign Out
  const handleGoogleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setData(prev => ({ ...prev, uid: undefined }));
    } catch (e) {
      console.error('Google logout error:', e);
    }
  };

  // Stage calculation
  const { stageInfo: currentStage, stageIdx: currentStageIndex, formVariant: currentFormVariant } = getFormStageInfo(data.exp, data.foodStats);
  const nextStage = ALL_ENCYCLOPEDIA_STAGES.find(s => s.threshold > data.exp && s.category === currentStage.category) || ALL_ENCYCLOPEDIA_STAGES.find(s => s.threshold > data.exp);

  // Feed handler: High EXP gain, small point gain with food-based branch evolution
  const handleFeed = useCallback((expGain: number, foodName: string, foodType?: string) => {
    setData(prev => {
      const newExp = prev.exp + expGain;
      const pointBonus = Math.max(5, Math.floor(expGain * 0.4));
      const newPoints = prev.points + pointBonus;
      const timeStr = new Date().toLocaleTimeString();
      const logText = `エサ「${foodName}」を摂取 (+${expGain} EXP, +${pointBonus}pt)`;

      const currentStats = prev.foodStats || { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 };
      const newFoodStats = { ...currentStats };
      if (foodType === 'cabbage') newFoodStats.cabbage = (newFoodStats.cabbage || 0) + 1;
      else if (foodType === 'apple') newFoodStats.apple = (newFoodStats.apple || 0) + 1;
      else if (foodType === 'glucose') newFoodStats.glucose = (newFoodStats.glucose || 0) + 1;
      else if (foodType === 'sugar') newFoodStats.sugar = (newFoodStats.sugar || 0) + 1;
      else if (foodType === 'twig') newFoodStats.twig = (newFoodStats.twig || 0) + 1;
      else newFoodStats.cabbage = (newFoodStats.cabbage || 0) + 1;

      const { stageIdx: prevStageIdx } = getFormStageInfo(prev.exp, prev.foodStats);
      const { stageInfo, stageIdx: newStageIdx, formVariant } = getFormStageInfo(newExp, newFoodStats);
      const newDiscovered = Array.from(new Set([...(prev.discoveredStages || []), stageInfo.name]));

      if (newStageIdx > prevStageIdx || stageInfo.name !== prev.name) {
        setEvolutionNotice(stageInfo);
        appendLogToGas(prev.gasWebAppUrl, 'EVOLUTION', `【形態進化】「${stageInfo.name}」へ羽化・変態。規律パラメータ更新。`, 0, prev.uid);
      }
      
      const updated: CaterpillarData = {
        ...prev,
        exp: newExp,
        points: newPoints,
        name: stageInfo.name,
        stage: newStageIdx,
        formVariant: formVariant,
        foodStats: newFoodStats,
        discoveredStages: newDiscovered,
        lastFedAt: new Date().toISOString(),
        logs: [{ time: timeStr, text: logText }, ...prev.logs.slice(0, 19)]
      };
      
      appendLogToGas(prev.gasWebAppUrl, 'FEED', logText, expGain, prev.uid);
      triggerGasSync(updated);
      return updated;
    });
  }, [triggerGasSync]);

  // Squash Level Down Handler
  const handleSquashLevelDown = useCallback((expLoss: number, reason: string) => {
    setData(prev => {
      const newExp = Math.max(0, prev.exp - expLoss);
      const timeStr = new Date().toLocaleTimeString();
      const logText = `⚠️【構造破壊警報】${reason} (-${expLoss} EXP)`;

      const { stageInfo, stageIdx: newStageIdx, formVariant } = getFormStageInfo(newExp, prev.foodStats);
      
      const updated: CaterpillarData = {
        ...prev,
        exp: newExp,
        name: stageInfo.name,
        stage: newStageIdx,
        formVariant: formVariant,
        logs: [{ time: timeStr, text: logText }, ...prev.logs.slice(0, 19)]
      };

      appendLogToGas(prev.gasWebAppUrl, 'PENALTY', logText, -expLoss, prev.uid);
      triggerGasSync(updated);
      return updated;
    });
  }, [triggerGasSync]);

  // Mini-game reward handler: High points (Coins), low EXP
  const handleMiniGameReward = useCallback((pointsGained: number, expGained: number, gameName: string) => {
    setData(prev => {
      const newPoints = prev.points + pointsGained;
      const newExp = prev.exp + expGained;
      const timeStr = new Date().toLocaleTimeString();
      const logText = `訓練「${gameName}」修了 (+${pointsGained}pt, +${expGained}EXP)`;

      const { stageIdx: prevStageIdx } = getFormStageInfo(prev.exp, prev.foodStats);
      const { stageInfo, stageIdx: newStageIdx, formVariant } = getFormStageInfo(newExp, prev.foodStats);
      const newDiscovered = Array.from(new Set([...(prev.discoveredStages || []), stageInfo.name]));

      if (newStageIdx > prevStageIdx || stageInfo.name !== prev.name) {
        setEvolutionNotice(stageInfo);
        appendLogToGas(prev.gasWebAppUrl, 'EVOLUTION', `【形態進化】「${stageInfo.name}」へ羽化・変態。規律パラメータ更新。`, 0, prev.uid);
      }

      const updated: CaterpillarData = {
        ...prev,
        points: newPoints,
        exp: newExp,
        name: stageInfo.name,
        stage: newStageIdx,
        formVariant: formVariant,
        discoveredStages: newDiscovered,
        logs: [{ time: timeStr, text: logText }, ...prev.logs.slice(0, 19)]
      };

      appendLogToGas(prev.gasWebAppUrl, 'GAME', logText, expGained, prev.uid);
      triggerGasSync(updated);
      return updated;
    });
  }, [triggerGasSync]);

  // Shop purchase: Furniture
  const handleBuyFurniture = useCallback((item: FurnitureItem) => {
    if (data.furniture.includes(item.id)) return;
    if (data.points < item.price) {
      setClerkQuote(getClerkInsufficientFundsQuote(item.name, item.price, data.points));
      return;
    }

    const clerkPhrases = [
      `「『${item.name}』のご注文を承認しました。領収書を保管し、ケージ内への物理配置プロトコルを即時実行します。」`,
      `「毎度ありがとうございます。『${item.name}』の検品完了。狂いなき規律空間の拡充を祈念いたします。」`,
      `「極めて合理的な設備投資です。『${item.name}』による規律向上効果を期待しております。」`
    ];
    const quote = clerkPhrases[Math.floor(Math.random() * clerkPhrases.length)];
    setClerkQuote(quote);

    setData(prev => {
      const updated: CaterpillarData = {
        ...prev,
        points: prev.points - item.price,
        furniture: [...prev.furniture, item.id],
        logs: [
          { time: new Date().toLocaleTimeString(), text: `設備「${item.name}」を購入・設置 (-${item.price}pt)` },
          ...prev.logs.slice(0, 19)
        ]
      };
      appendLogToGas(prev.gasWebAppUrl, 'SHOP', `設備「${item.name}」を購入`, 0, prev.uid);
      triggerGasSync(updated);
      return updated;
    });
  }, [data.furniture, data.points, triggerGasSync]);

  // Shop purchase: Spray (80pt)
  const handleBuySpray = useCallback(() => {
    const cost = 80;
    if (data.points < cost) {
      setClerkQuote(getClerkInsufficientFundsQuote('防虫・規律スプレー', cost, data.points));
      return;
    }

    setClerkQuote('「『防虫・規律スプレー』を1個補充しました。侵入者やダーリンちゃんを即座に撃退できます。」');
    setData(prev => {
      const currentCount = prev.sprayCount || 0;
      const updated: CaterpillarData = {
        ...prev,
        points: prev.points - cost,
        sprayCount: currentCount + 1,
        logs: [
          { time: new Date().toLocaleTimeString(), text: `防虫・規律スプレーを購入 (所持数: ${currentCount + 1}回)` },
          ...prev.logs.slice(0, 19)
        ]
      };
      appendLogToGas(prev.gasWebAppUrl, 'SHOP', '防虫スプレーを購入', 0, prev.uid);
      triggerGasSync(updated);
      return updated;
    });
  }, [data.points, triggerGasSync]);

  // Shop purchase: Daycare (50pt for 24h protection - cumulative)
  const handleBuyDaycare = useCallback(() => {
    const cost = 50;
    if (data.points < cost) {
      setClerkQuote(getClerkInsufficientFundsQuote('芋虫保育園 24時間パス', cost, data.points));
      return;
    }

    const now = Date.now();
    const currentUntil = data.daycareUntil ? new Date(data.daycareUntil).getTime() : 0;
    const baseTime = currentUntil > now ? currentUntil : now;
    const newUntil = new Date(baseTime + 24 * 60 * 60 * 1000).toISOString();
    const hoursLeft = Math.round((new Date(newUntil).getTime() - now) / (1000 * 60 * 60));

    setClerkQuote(`「『芋虫保育園 24時間パス』を発行しました（累計保護残り: 約${hoursLeft}時間）。期間中は放置してもダーリンちゃんに乗っ取られません。」`);
    setData(prev => {
      const updated: CaterpillarData = {
        ...prev,
        points: prev.points - cost,
        daycareUntil: newUntil,
        logs: [
          { time: new Date().toLocaleTimeString(), text: `芋虫保育園（+24h累積保護）を購入 (残り約${hoursLeft}時間)` },
          ...prev.logs.slice(0, 19)
        ]
      };
      appendLogToGas(prev.gasWebAppUrl, 'SHOP', '保育園パスを購入', 0, prev.uid);
      triggerGasSync(updated);
      return updated;
    });
  }, [data.daycareUntil, data.points, triggerGasSync]);

  // Use spray handler
  const handleUseSpray = useCallback(() => {
    setData(prev => {
      const updated = {
        ...prev,
        sprayCount: Math.max(0, (prev.sprayCount || 1) - 1)
      };
      triggerGasSync(updated);
      return updated;
    });
  }, [triggerGasSync]);

  // Resolve Darling-chan incident handler
  const handleResolveDarlingIncident = useCallback((success: boolean) => {
    setData(prev => {
      if (success) {
        // Restored successfully!
        const updated: CaterpillarData = {
          ...prev,
          darlingIncident: false,
          lastFedAt: new Date().toISOString(),
          logs: [
            { time: new Date().toLocaleTimeString(), text: '✨【救出成功】ILIダーリンちゃんの機嫌を推測し、元の芋虫を取り戻した！' },
            ...prev.logs.slice(0, 19)
          ]
        };
        appendLogToGas(prev.gasWebAppUrl, 'RECOVERY', 'ダーリンちゃんから芋虫救出成功', 0, prev.uid);
        triggerGasSync(updated);
        return updated;
      } else {
        // Reset to Lv1
        const stage0 = STAGES[0];
        const updated: CaterpillarData = {
          ...prev,
          darlingIncident: false,
          exp: 0,
          stage: 0,
          name: stage0.name,
          lastFedAt: new Date().toISOString(),
          logs: [
            { time: new Date().toLocaleTimeString(), text: '🔄【再起動】救出を断念し、Stage 0 (Lv1) から芋虫を育て直すことにした。' },
            ...prev.logs.slice(0, 19)
          ]
        };
        appendLogToGas(prev.gasWebAppUrl, 'RESET', 'ダーリンちゃん救出断念によりLv1初期化', 0, prev.uid);
        triggerGasSync(updated);
        return updated;
      }
    });
  }, [triggerGasSync]);

  // Chat Submission
  const handleSendChat = async () => {
    if (!inputText.trim() || isChatting) return;
    const text = inputText.trim();
    setInputText('');
    
    const newMsgs = [...chatMessages, { role: 'user' as const, text }];
    setChatMessages(newMsgs);
    setIsChatting(true);

    try {
      appendChatToGas(data.gasWebAppUrl, data.ownerName || '飼育員', text, data.uid);
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          stageName: data.name,
          stage: data.stage,
          exp: data.exp,
          ownerName: data.ownerName,
          selfType: data.selfType,
          furniture: data.furniture
        })
      });

      if (res.ok) {
        const json = await res.json();
        const reply = json.reply || 'モゾ……論理構造を再検証中。';
        setChatMessages(m => [...m, { role: 'lsi', text: reply, provider: json.provider }]);
        appendChatToGas(data.gasWebAppUrl, data.name, reply, data.uid);
      } else {
        setChatMessages(m => [...m, { role: 'lsi', text: 'モゾ……通信規約に一時的な例外を検知。論理回路を保護した。' }]);
      }
    } catch {
      setChatMessages(m => [...m, { role: 'lsi', text: 'モゾ……通信回線が不安定だ。境界線内に待機せよ。' }]);
    } finally {
      setIsChatting(false);
    }
  };

  // Share text generation
  const getShareText = () => {
    return `🐛【LSI芋虫観察日記】\n現在の形態: ${data.name}\n規律EXP: ${data.exp} | 保有コイン: ${data.points}pt\n飼育員: ${data.ownerName} (${data.selfType})\n#LSI芋虫 #ソシオニクス #MBTI`;
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(getShareText());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="text-sm font-black text-stone-600 animate-pulse">
          🧪 統制プロトコル起動中……
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center justify-start p-3 sm:p-5">
      
      {/* Outer Constrained Container */}
      <div className="w-full max-w-4xl flex flex-col gap-3 sm:gap-4">

        {/* Auth notice banner if unauthorized domain or error */}
        {authErrorMsg && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{authErrorMsg}</span>
            </div>
            <button
              onClick={() => setAuthErrorMsg(null)}
              className="text-amber-700 hover:text-amber-950 font-bold ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top App Header */}
        <header className="bg-white border-2 border-stone-300 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-row items-center justify-between gap-3">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
              🐛
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-emerald-950 flex items-center gap-2">
                <span>LSI芋虫育成シミュレーター</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Ti-Se / 1F
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 font-medium line-clamp-1">
                規律と境界線を愛する不器用な論理芋虫の飼育・観察記録
              </p>
            </div>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            
            {/* How to play Button */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>遊び方</span>
            </button>

            {/* Encyclopedia Button */}
            <button
              onClick={() => setIsEncyclopediaOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>図鑑 ({data.discoveredStages?.length || 1}/{STAGES.length})</span>
            </button>

            {/* Schedule Button */}
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>24h予定</span>
            </button>

            {/* Profile Button */}
            <button
              onClick={() => {
                setTempName(data.ownerName);
                setTempType(data.selfType);
                setIsProfileModalOpen(true);
              }}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 transition cursor-pointer"
              title="飼育員プロフィール"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Manual Save Button */}
            <button
              onClick={handleManualSave}
              disabled={syncStatus === 'syncing'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 border ${
                syncStatus === 'syncing'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 cursor-wait'
                  : syncStatus === 'synced'
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                  : syncStatus === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-white hover:bg-stone-50 border-stone-300 text-stone-800'
              }`}
              title={lastSavedTime ? `最終保存: ${lastSavedTime}` : 'ブラウザに手動保存'}
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>保存中...</span>
                </>
              ) : syncStatus === 'synced' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>保存完了</span>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>保存再試行</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-emerald-700" />
                  <span>セーブ</span>
                </>
              )}
            </button>

            {/* Google Account Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 pl-2.5 pr-1.5 py-1 rounded-xl">
                <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-[80px] truncate">{currentUser.displayName || data.ownerName}</span>
                </span>
                <button
                  onClick={handleGoogleLogout}
                  className="p-1 text-stone-400 hover:text-red-600 transition cursor-pointer"
                  title="ログアウト"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google同期</span>
              </button>
            )}

            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="bg-stone-800 hover:bg-stone-700 text-white p-2 rounded-xl transition shadow-xs cursor-pointer"
              title="観察記録を共有"
            >
              <Share2 className="w-4 h-4" />
            </button>

          </div>

          {/* Mobile Hamburger & Quick Save Buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={handleManualSave}
              disabled={syncStatus === 'syncing'}
              className={`p-2 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
                syncStatus === 'syncing'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : syncStatus === 'synced'
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                  : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-100'
              }`}
              title="データを保存"
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              ) : syncStatus === 'synced' ? (
                <Check className="w-4 h-4 text-emerald-700" />
              ) : (
                <Save className="w-4 h-4 text-emerald-700" />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 transition cursor-pointer"
              aria-label="メニューを開く"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </header>

        {/* Global Navigation Tabs */}
        <nav className="grid grid-cols-5 gap-1 sm:gap-2 bg-stone-200/80 p-1.5 rounded-2xl border border-stone-300">
          {[
            { id: 'status', label: 'ステータス', icon: Bug },
            { id: 'observation', label: 'リアル観察', icon: Eye },
            { id: 'shop', label: '購買部', icon: Store },
            { id: 'training', label: '規律訓練', icon: Gamepad2 },
            { id: 'chat', label: '対話監査', icon: Send }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 sm:px-3 rounded-xl font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-emerald-900 shadow-sm border border-stone-200 scale-[1.02]' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* -------------------------------------------------------------
            TAB 1: STATUS & FEEDING
        ------------------------------------------------------------- */}
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Col: Interactive Room Cage */}
            <div className="lg:col-span-2 bg-white border-2 border-stone-300 rounded-2xl p-4 shadow-xs flex flex-col min-h-[440px]">
              <CaterpillarRoom 
                onFeed={handleFeed} 
                stage={data.stage} 
                formVariant={data.formVariant || currentFormVariant}
                ownedFurniture={data.furniture}
                onSquashLevelDown={handleSquashLevelDown}
                sprayCount={data.sprayCount || 0}
                onUseSpray={handleUseSpray}
                isDarlingIncident={data.darlingIncident}
                darlingMoodTarget={data.darlingMoodTarget}
                onResolveDarlingIncident={handleResolveDarlingIncident}
              />
            </div>

            {/* Right Col: Stats & Growth Progress */}
            <div className="flex flex-col gap-3.5">
              
              {/* Profile Card */}
              <div className="bg-white border-2 border-stone-300 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {currentStage.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{data.points} TP</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-black text-stone-900 flex items-center gap-1.5">
                    <span>{currentStage.visual}</span>
                    <span>{currentStage.name}</span>
                  </h2>
                  <p className="text-xs text-stone-500 font-medium mt-1 leading-relaxed">
                    {currentStage.desc}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-1.5 mt-1 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-stone-500">規律EXP</span>
                    <span className="text-emerald-800">
                      {data.exp} {nextStage ? `/ ${nextStage.threshold}` : '(MAX)'}
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: nextStage 
                          ? `${Math.min(100, (data.exp / nextStage.threshold) * 100)}%` 
                          : '100%' 
                      }}
                    />
                  </div>
                  {nextStage && (
                    <span className="text-[10px] text-stone-400 text-right">
                      次段階「{nextStage.name}」まで あと {Math.max(0, nextStage.threshold - data.exp)} EXP
                    </span>
                  )}
                </div>

                {/* Daycare & Spray Badges */}
                <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                  {data.sprayCount ? (
                    <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-sky-600" />
                      <span>スプレー: {data.sprayCount}回</span>
                    </span>
                  ) : null}

                  {data.daycareUntil && new Date(data.daycareUntil).getTime() > new Date(data.lastFedAt || 0).getTime() ? (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-emerald-600" />
                      <span>保育園保護中（24h+）</span>
                    </span>
                  ) : null}
                </div>

                {/* Flavor Quote */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900 font-medium italic">
                  {currentStage.flavorQuote}
                </div>

                {/* Owner info */}
                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
                  <span>飼育員: <strong className="text-stone-800">{data.ownerName}</strong> ({data.selfType})</span>
                  <button
                    onClick={() => {
                      setTempName(data.ownerName);
                      setTempType(data.selfType);
                      setIsProfileModalOpen(true);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>変更</span>
                  </button>
                </div>

              </div>

              {/* Data Persistence & Manual Save Widget */}
              <div className="bg-white border-2 border-stone-300 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-emerald-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-stone-800 flex items-center gap-1">
                      <span>データ同期状態</span>
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {lastSavedTime ? `最終保存: ${lastSavedTime}` : '自動保存・待機中'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleManualSave}
                  disabled={syncStatus === 'syncing'}
                  className="bg-emerald-700 hover:bg-emerald-600 active:scale-95 disabled:bg-stone-300 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      <span>今すぐセーブ</span>
                    </>
                  )}
                </button>
              </div>

              {/* Activity Log */}
              <div className="bg-white border-2 border-stone-300 rounded-2xl p-4 shadow-xs flex-1 flex flex-col">
                <h3 className="text-xs font-black text-stone-700 flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>規律監査ログ（直近）</span>
                </h3>
                <div className="flex-1 overflow-y-auto max-h-[160px] flex flex-col gap-1.5 pr-1 text-xs">
                  {data.logs.map((log, i) => (
                    <div key={i} className="text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100 leading-snug">
                      <span className="font-mono text-[10px] text-stone-400 mr-1.5">[{log.time}]</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: OBSERVATION MODE
        ------------------------------------------------------------- */}
        {activeTab === 'observation' && (
          <div className="bg-white border-2 border-stone-300 rounded-2xl p-4 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between bg-stone-50 p-3.5 rounded-xl border border-stone-200">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-800" />
                <div>
                  <h3 className="text-sm font-black text-stone-800">24時間リアルタイム規律観察カメラ</h3>
                  <p className="text-xs text-stone-500">
                    現在の時間帯プロトコルに完全連動した芋虫の生態行動をモニタリング中
                  </p>
                </div>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full animate-pulse">
                ● LIVE REC
              </span>
            </div>

            <div className="min-h-[440px] w-full flex flex-col">
              <CaterpillarRoom 
                onFeed={handleFeed} 
                stage={data.stage} 
                ownedFurniture={data.furniture}
                observationMode={true}
                onSquashLevelDown={handleSquashLevelDown}
                sprayCount={data.sprayCount || 0}
                onUseSpray={handleUseSpray}
                isDarlingIncident={data.darlingIncident}
                darlingMoodTarget={data.darlingMoodTarget}
                onResolveDarlingIncident={handleResolveDarlingIncident}
              />
            </div>

            {/* 24h Daily Schedule Timetable */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-stone-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>24時間 規律行動スケジュール一覧</span>
                </h3>
                <span className="text-[11px] text-stone-500 font-medium">
                  現在時刻: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {DAILY_SCHEDULE.map((item, idx) => {
                  const currentHour = new Date().getHours();
                  const isCurrent = currentHour >= item.startHour && currentHour < item.endHour;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col gap-1 ${
                        isCurrent
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-400/30'
                          : 'bg-white border-stone-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-stone-500">
                          {String(item.startHour).padStart(2, '0')}:00 - {String(item.endHour).padStart(2, '0')}:00
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.2 rounded-full animate-pulse">
                            ● 実施中
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-xs text-stone-900 flex items-center gap-1">
                        <span>{item.emoji}</span>
                        <span>{item.title}</span>
                      </h4>
                      <p className="text-[11px] text-stone-600 leading-tight">
                        {item.action}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: SHOP
        ------------------------------------------------------------- */}
        {activeTab === 'shop' && (
          <div className="bg-white border-2 border-stone-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-5">
            
            {/* Clerk Box */}
            <div 
              onClick={rollClerkQuote}
              className="bg-emerald-50 hover:bg-emerald-100/80 transition-colors border-2 border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 cursor-pointer select-none group"
              title="クリックで店員の規律アドバイスを切り替え"
            >
              <div className="relative w-16 h-16 rounded-full bg-emerald-200 border-2 border-emerald-500 flex items-center justify-center shrink-0 shadow-md overflow-hidden group-hover:scale-105 transition-transform">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/staff.png" 
                  alt="LSI店員" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to cute avatar if image doesn't exist
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.staff-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <span className="staff-fallback hidden text-3xl">🧑‍💼</span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-black bg-emerald-800 text-white px-2 py-0.5 rounded">
                    購買部 LSI規律相談窓口
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>相談する（クリック）</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-stone-800 mt-1 leading-relaxed">
                  {clerkQuote}
                </p>
              </div>

              <div className="bg-white border border-emerald-300 px-3.5 py-2 rounded-xl text-center shrink-0 shadow-xs">
                <span className="text-[10px] font-bold text-stone-400 block">所持ポイント</span>
                <span className="text-base font-black text-amber-600 flex items-center justify-center gap-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>{data.points} TP</span>
                </span>
              </div>
            </div>

            {/* Defensive & Consumable Items */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>防衛・デイケア特需品</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Item 1: Spray */}
                <div className="bg-sky-50/60 border-2 border-sky-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-3xl">
                      💨
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-stone-900">防虫・規律スプレー</h4>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                        ご褒美・ダーリンちゃんをシュッと即座に撃退！ (所持: {data.sprayCount || 0}回)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBuySpray}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    80 TP
                  </button>
                </div>

                {/* Item 2: Daycare */}
                <div className="bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-3xl">
                      🏡
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-stone-900">芋虫保育園 24hパス</h4>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                        放置しても安心！ 24時間ダーリンちゃんの乗っ取りを防ぐ
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBuyDaycare}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                  >
                    50 TP
                  </button>
                </div>
              </div>
            </div>

            {/* Furniture Grid */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-700" />
                <span>ケージ内統制設備・家具一覧（全8種）</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {AVAILABLE_FURNITURE.map(item => {
                  const isOwned = data.furniture.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      className={`border-2 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all ${
                        isOwned 
                          ? 'bg-stone-50 border-stone-200 opacity-85' 
                          : 'bg-white border-stone-300 hover:border-emerald-500 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-3xl shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-stone-900">{item.name}</h4>
                          <p className="text-[11px] text-stone-500 font-medium mt-0.5 leading-tight">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isOwned ? (
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>設置済</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBuyFurniture(item)}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{item.price} TP</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: MINI-GAMES / TRAINING
        ------------------------------------------------------------- */}
        {activeTab === 'training' && (
          <div className="bg-white border-2 border-stone-300 rounded-2xl p-4 shadow-xs">
            <MiniGames 
              onReward={handleMiniGameReward}
              caterpillarStage={data.name}
            />
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: CHAT / AUDIT
        ------------------------------------------------------------- */}
        {activeTab === 'chat' && (
          <div className="bg-white border-2 border-stone-300 rounded-2xl p-4 shadow-xs flex flex-col gap-3 min-h-[480px]">
            
            {/* Chat Header */}
            <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <div>
                  <h3 className="text-xs font-black text-stone-800">LSI芋虫 論理対話・監査セッション</h3>
                  <p className="text-[11px] text-stone-500">Gemini 2.5 Flash によるリアルタイム構造化対話</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Ti-Se 応答モード
              </span>
            </div>

            {/* Chat Message List */}
            <div className="flex-1 overflow-y-auto max-h-[360px] flex flex-col gap-2.5 p-2 bg-stone-50/50 rounded-xl border border-stone-200">
              {chatMessages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={i} 
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] font-bold text-stone-400 mb-0.5 px-1">
                      {isUser ? (data.ownerName || '飼育員') : data.name}
                    </span>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                        isUser 
                          ? 'bg-emerald-700 text-white rounded-tr-none' 
                          : 'bg-white border-2 border-stone-200 text-stone-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {isChatting && (
                <div className="self-start bg-white border border-stone-200 rounded-2xl px-4 py-2 text-xs text-stone-400 font-mono animate-pulse">
                  モゾ……論理構文を解析中……
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="flex gap-2">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="LSI芋虫に規律や日常の相談を送信……"
                className="flex-1 bg-stone-50 border-2 border-stone-300 focus:border-emerald-600 focus:bg-white rounded-xl px-4 py-2 text-xs sm:text-sm text-stone-800 focus:outline-none transition-colors"
                disabled={isChatting}
              />
              <button
                onClick={handleSendChat}
                disabled={isChatting || !inputText.trim()}
                className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>送信</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* -------------------------------------------------------------
          MODAL: HOW TO PLAY (遊び方)
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {isHelpModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-stone-300 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-700" />
                  <span>📖 LSI芋虫 遊び方・規律ガイド</span>
                </h3>
                <button 
                  onClick={() => setIsHelpModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                
                {/* Section 1: Rearing */}
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
                  <h4 className="font-black text-emerald-900 flex items-center gap-1.5 mb-1">
                    <span>1. 🐛 エサやりでEXPを稼いで形態進化！</span>
                  </h4>
                  <p className="text-xs text-stone-600">
                    ケージ内をクリック（タップ）してエサを投下。芋虫が食べてEXPが上昇し、<strong>さなぎ（繭/水晶/成熟蛹）を経て完全統制蝶🦋</strong>へ羽化します！
                  </p>
                </div>

                {/* Section 2: Mini-games */}
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                  <h4 className="font-black text-amber-900 flex items-center gap-1.5 mb-1">
                    <span>2. 🧠 ミニゲームで大量コイン（TP）を稼ぐ！</span>
                  </h4>
                  <p className="text-xs text-stone-600">
                    「規律訓練」タブで4つのミニゲーム（物理反射・概念仕分け・不器用Fe対話・芋虫もぐら叩き）に挑戦！ ハイスコアで大量のTP（購買部用コイン）を獲得できます。
                  </p>
                </div>

                {/* Section 3: Shop & Spray */}
                <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl">
                  <h4 className="font-black text-sky-900 flex items-center gap-1.5 mb-1">
                    <span>3. 🛒 購買部で家具＆防衛アイテムを購入！</span>
                  </h4>
                  <p className="text-xs text-stone-600">
                    ケージにレザーソファや精密定規を配置！ さらに「防虫スプレー」や「保育園パス」を買っておくと、放置時のトラブルを未然に防ぐことができます。
                  </p>
                </div>

                {/* Section 4: Neglect Incident */}
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl">
                  <h4 className="font-black text-rose-900 flex items-center gap-1.5 mb-1">
                    <span>4. 🚨 放置の危機とダーリンちゃん救出！</span>
                  </h4>
                  <p className="text-xs text-stone-600">
                    お世話をサボると、ILIダーリンちゃん（🥺）がケージを占拠！ 1〜100の機嫌当てゲームに正解して、元の芋虫を取り戻しましょう。
                  </p>
                </div>

                {/* Section 5: 30 Taps Squash */}
                <div className="bg-stone-100 border border-stone-200 p-3.5 rounded-2xl">
                  <h4 className="font-black text-stone-800 flex items-center gap-1.5 mb-1">
                    <span>5. 💥 30回タップ圧殺と立体復旧</span>
                  </h4>
                  <p className="text-xs text-stone-600">
                    芋虫を30回過剰タップするとペシャンコに完全平面化し、EXPが低下します。「構造再定義」ボタンを押して3次元立体を復旧しましょう！
                  </p>
                </div>

              </div>

              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition text-xs cursor-pointer shadow-xs"
              >
                理解した（閉じる）
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL: ENCYCLOPEDIA (形態図鑑)
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {isEncyclopediaOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-stone-300 rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                  <span>📖 LSI芋虫 形態進化図鑑（Stage 0〜5）</span>
                </h3>
                <button 
                  onClick={() => setIsEncyclopediaOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {ALL_ENCYCLOPEDIA_STAGES.map((s) => {
                  const isDiscovered = data.discoveredStages?.includes(s.name) || data.name === s.name;
                  const isCurrent = data.name === s.name;

                  return (
                    <div 
                      key={s.name}
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        isCurrent
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
                          : isDiscovered 
                          ? 'bg-white border-stone-200 shadow-xs' 
                          : 'bg-stone-100/70 border-dashed border-stone-300 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-3xl shrink-0 overflow-hidden p-1">
                            {isDiscovered ? (
                              s.chrysalisVariant ? (
                                <ChrysalisSVG variant={s.chrysalisVariant} size={48} />
                              ) : (
                                <span>{s.visual}</span>
                              )
                            ) : (
                              <span>❓</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black bg-stone-800 text-white px-2 py-0.2 rounded">
                                {s.badge}
                              </span>
                              {s.category && (
                                <span className={`text-[10px] font-black px-2 py-0.2 rounded ${
                                  s.category === 'Ti' ? 'bg-blue-100 text-blue-800' :
                                  s.category === 'Se' ? 'bg-rose-100 text-rose-800' :
                                  s.category === 'Ne' ? 'bg-emerald-100 text-emerald-800' :
                                  s.category === 'Fe' ? 'bg-amber-100 text-amber-800' :
                                  'bg-stone-200 text-stone-700'
                                }`}>
                                  {s.category === 'Ti' ? 'Ti論理構造' :
                                   s.category === 'Se' ? 'Se物理防壁' :
                                   s.category === 'Ne' ? 'Ne電脳解析' :
                                   s.category === 'Fe' ? 'Fe黄金調和' : '基本'}
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.2 rounded animate-pulse">
                                  現在形態
                                </span>
                              )}
                            </div>
                            <h4 className="font-black text-sm text-stone-900 mt-1">
                              {isDiscovered ? s.name : '？？？（未解放形態）'}
                            </h4>
                          </div>
                        </div>

                        <span className="text-xs font-black text-stone-500 shrink-0">
                          EXP {s.threshold}
                        </span>
                      </div>

                      {isDiscovered ? (
                        <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex flex-col gap-1 text-xs">
                          <p className="text-stone-600 font-medium">{s.desc}</p>
                          <p className="text-emerald-800 font-bold text-[11px] mt-0.5">{s.disciplineTitle}</p>
                          <p className="text-stone-500 italic text-[11px]">“{s.flavorQuote}”</p>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-stone-400 font-medium">
                          🔒 解放条件: 規律EXP {s.threshold} 以上（ヒント: {s.hint}）
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setIsEncyclopediaOpen(false)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-2.5 rounded-xl transition text-xs cursor-pointer shadow-xs"
              >
                閉じる
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL: PROFILE EDIT
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-stone-300 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4"
            >
              <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-800" />
                <span>飼育員プロファイルの編集</span>
              </h3>
              
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-600 mb-1 block">飼育員名（呼び名）</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-600 mb-1 block">性格タイプ（MBTI / ソシオ）</label>
                  <input
                    type="text"
                    value={tempType}
                    onChange={(e) => setTempType(e.target.value)}
                    placeholder="例: EIE, INFJ, 4w3 など"
                    className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2 rounded-xl text-xs cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    const updated = {
                      ...data,
                      ownerName: tempName.trim() || '飼育員',
                      selfType: tempType.trim() || '未設定'
                    };
                    setData(updated);
                    triggerGasSync(updated);
                    setIsProfileModalOpen(false);
                  }}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  保存する
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL: 24-HOUR SCHEDULE VIEW
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-stone-300 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-800" />
                  <span>24時間 規律行動スケジュール</span>
                </h3>
                <button 
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-stone-500">
                LSI芋虫は厳格なタイムテーブルに従って生息しています。
              </p>

              <div className="flex flex-col gap-2">
                {DAILY_SCHEDULE.map((item, idx) => {
                  const currentHour = new Date().getHours();
                  const isCurrent = currentHour >= item.startHour && currentHour < item.endHour;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                          : 'bg-stone-50 border-stone-200 opacity-90'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl shrink-0 mt-0.5">{item.emoji}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-xs sm:text-sm text-stone-900">
                              {item.title}
                            </h4>
                            {isCurrent && (
                              <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.2 rounded-full animate-pulse">
                                ● 実施中
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5">
                            {item.action}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-stone-500 shrink-0">
                        {String(item.startHour).padStart(2, '0')}:00 - {String(item.endHour).padStart(2, '0')}:00
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-2.5 rounded-xl transition text-xs cursor-pointer shadow-xs mt-2"
              >
                閉じる
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL: MOBILE HAMBURGER DRAWER
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-72 h-full p-5 shadow-2xl flex flex-col gap-4 justify-between"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🐛</span>
                    <span className="font-black text-sm text-stone-900">メニュー</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleManualSave();
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold text-left cursor-pointer transition"
                  >
                    <Save className="w-4 h-4 text-emerald-700" />
                    <div className="flex flex-col">
                      <span>💾 今すぐセーブ（手動保存）</span>
                      <span className="text-[10px] text-stone-500 font-normal">
                        {lastSavedTime ? `最終: ${lastSavedTime}` : 'ブラウザに保存'}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsHelpModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100 text-stone-800 text-xs font-bold text-left cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-700" />
                    <span>📖 遊び方・ルール</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsEncyclopediaOpen(true);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100 text-stone-800 text-xs font-bold text-left cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>📚 形態図鑑 ({data.discoveredStages?.length || 1}/{STAGES.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsScheduleModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100 text-stone-800 text-xs font-bold text-left cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>⏰ 24時間予定表</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setTempName(data.ownerName);
                      setTempType(data.selfType);
                      setIsProfileModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100 text-stone-800 text-xs font-bold text-left cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-700" />
                    <span>👤 飼育員プロフィール変更</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsShareModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-100 text-stone-800 text-xs font-bold text-left cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-emerald-700" />
                    <span>🔗 観察日記を共有</span>
                  </button>
                </div>
              </div>

              {/* Bottom Auth button in Drawer */}
              <div className="border-t border-stone-200 pt-3">
                {currentUser ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-stone-500 font-medium">ログイン中</span>
                      <span className="text-xs font-bold text-emerald-900 truncate max-w-[140px]">
                        {currentUser.displayName || data.ownerName}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleGoogleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                      title="ログアウト"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleGoogleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Googleアカウントで同期</span>
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL: SHARE
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-stone-300 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center"
            >
              <h3 className="text-base font-black text-stone-900">観察日記を共有</h3>
              
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-700 text-left font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                {getShareText()}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleShareTwitter}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>X (Twitter)</span>
                </button>
                <button
                  onClick={handleCopyShare}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedShare ? 'コピー完了' : '本文コピー'}</span>
                </button>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                閉じる
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL: EVOLUTION CELEBRATION
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {evolutionNotice && (
          <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white border-3 border-emerald-500 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-4xl shadow-md animate-bounce">
                {evolutionNotice.visual}
              </div>

              <div>
                <span className="text-[10px] font-black bg-emerald-800 text-white px-2 py-0.5 rounded">
                  {evolutionNotice.badge} 達成
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  「{evolutionNotice.name}」へ羽化・変態！
                </h3>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                {evolutionNotice.desc}
              </p>

              <p className="text-xs font-bold text-emerald-900 italic">
                {evolutionNotice.flavorQuote}
              </p>

              <button
                onClick={() => setEvolutionNotice(null)}
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition text-xs shadow-xs cursor-pointer active:scale-95 mt-1"
              >
                規律を継続する
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          FLOATING SAVE TOAST NOTIFICATION
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur-sm text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-stone-700 pointer-events-none"
          >
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
