'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  ShieldAlert, 
  Sparkles,
  Zap,
  HelpCircle,
  X,
  Wind,
  ShieldCheck,
  HeartCrack,
  AlertTriangle
} from 'lucide-react';

import ChrysalisSVG from './ChrysalisSVG';

type Position = { x: number; y: number };
type Food = { id: number; pos: Position; type: string; name: string; exp: number };

export interface FurnitureItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  desc: string;
  x: number;
  y: number;
  interactionTexts: string[];
  isToy?: boolean;
}

export const AVAILABLE_FURNITURE: FurnitureItem[] = [
  { 
    id: 'sofa', 
    name: '構造化レザーソファ', 
    icon: '🛋️', 
    price: 150, 
    desc: '1F/物理支配エリア。骨格の規律を保ち、優雅に沈み込む。', 
    x: 28, 
    y: 26,
    interactionTexts: [
      'モゾ…【1F領域支配完了】構造化レザーの弾性を検証しつつ骨格を休息。',
      '沈み込み率8.4%……反発係数は理想的な物理数値を維持している。',
      '座面の革の縫製に狂いなし。極めて合理的な休息スペースだ。',
      '外骨格の疲労度を測定中。このソファの反発力は骨格規律に最適だ。',
      '皮脂や摩擦による表面劣化を防止するため、接触面を15分ごとに均等シフト。',
      'モゾ…クッション内部の密度分散を確認。背骨のS字ライン（規律）が保持される。',
      '非合理なリラックスではない。次の防衛行動に向けた「戦略的静止」だ。',
      '（すっぽり）……物理的な境界線に包まれる感覚。空間占拠率が12%上昇。'
    ]
  },
  { 
    id: 'coffee', 
    name: '無調整ブラック珈琲サーバー', 
    icon: '☕', 
    price: 30, 
    desc: '覚醒状態を維持し、思考の歪みを0.01%以下に排除する。', 
    x: 72, 
    y: 25,
    interactionTexts: [
      '（コクコク…）カフェイン摂取完了。思考プロセッサのクロック周波数を最大化。',
      '苦味と酸味の黄金比率を確認。論理の歪みを0.001%以下に冷却。',
      '抽出温度92.4℃……完全無欠の抽出プロトコルだ。',
      '糖類添加ゼロ。規律を乱す甘美な誘惑を徹底排除した。',
      '（ごく…）……体温が0.3℃上昇。中枢神経への刺激により、境界線監視の精度が向上。',
      '砂糖やミルクの混入は思考の濁りを生む。この漆黒こそが純粋な論理だ。',
      'サーバーの残り油分を計算。洗浄タイマーを3分後にセット。',
      'カフェインの血中濃度が適正値に達した。これより空間統制タスクを再開する。'
    ]
  },
  { 
    id: 'ball', 
    name: '物理法則ボール', 
    icon: '⚽', 
    price: 60, 
    desc: '触れると運動量保存の法則に従ってコロコロ転がる物理トイ。', 
    x: 48, 
    y: 65,
    interactionTexts: [
      '（コツン…コロコロ…）運動量保存の法則を確認。完全弾性衝突のシミュレーション完了。',
      'ボールの球体真円度99.98%……転がり抵抗をミリ単位で測定中。',
      '自発的推進力でボールへ接触。放物線軌道の力学を検証した。',
      '（ポーン！）運動エネルギーの移動を観測。物理空間の秩序に合致。',
      '（ペシッ…）……摩擦係数の影響で減速。アイザック・ニュートンの正しさを再証明。',
      '転がる軌道に1ミリのブレもなし。ケージ内の平坦度が規律通りである証拠だ。',
      '遊戯ではない。これは重力と加速度に関する連続物理実験である。',
      '（バンッ）壁に跳ね返り静止。エネルギーの拡散と消滅を観測完了。'
    ],
    isToy: true
  },
  { 
    id: 'teddy', 
    name: '秩序のテディベア', 
    icon: '🧸', 
    price: 90, 
    desc: '綿の充填率が100%均一なぬいぐるみ。抱きしめて触感を監査する。', 
    x: 20, 
    y: 60,
    interactionTexts: [
      'モゾ…【触感監査】非合理な愛着を検知……しかし綿の充填率は規律通り均一。合格だ。',
      '（ギュッ…）……情動反応（4E）の発生を観測。直ちに論理で中和する。',
      'ぬいぐるみの耳の左右対称性を点検。狂いなし、ケージ内保持を認可。',
      '抱き心地の弾性係数を計算中。……悪くない感触だ。',
      '（スリスリ…）……誤解するな、表面のポリエステル繊維の密着度をテストしているだけだ。',
      'このぬいぐるみの重心位置は完璧に中央にある。視覚的・物理的安定感が極めて高い。',
      '……情動的な依存ではない。外骨格にかかる圧力を分散するためのクッション体だ。',
      '（じーっ）目ボタンの縫い付け強度：3.5kgまで耐えうると推定。防衛器具としても機能する。'
    ],
    isToy: true
  },
  { 
    id: 'law_book', 
    name: '六法全書・ケージ利用規約', 
    icon: '⚖️', 
    price: 120, 
    desc: '3万字におよぶケージ統制規則集。条文の穴は一切許さない。', 
    x: 82, 
    y: 75,
    interactionTexts: [
      '【規約精読】第142条第3項「境界線侵犯時の即時排除条項」を検証中。',
      '「エサの投下角度と受け入れ義務に関する附則」に新たな論理条項を追記。',
      '条文の穴は一切存在しない。完全なる法治空間を確立。',
      '判例第508号「過剰タップによる損壊責任の帰属」を熟読中。',
      '第89条「飼育員の不条理なからかいに対する抗議権」の解釈を厳格化。',
      '（ページをめくる音）索引のアルファベット順に0.1ミリの狂いもなし。美しい分類だ。',
      '法なき空間は混沌を生む。この3万字の条文こそがケージの平和を支える骨格だ。',
      '無用な連打行為は第12条「過度の物理的干渉」に該当。記録済みだ。'
    ]
  },
  { 
    id: 'ruler', 
    name: 'レーザー精密定規', 
    icon: '📐', 
    price: 80, 
    desc: '領域の境界線を1ミリの狂いもなく測定・防衛する。', 
    x: 88, 
    y: 30,
    interactionTexts: [
      '【ミリ単位計測】ケージ内壁の歪み：0.002mm……完全な直角を確認。',
      '境界線の目盛りと照合中。1ミリの侵犯も見逃さない。',
      'レーザー波長650nmによる空間測量完了。安全地帯を確定。',
      'ケージ対角線の長さを再検証。ピタゴラスの定理通り、誤差ゼロ。',
      '（ピッ）床の水平度を自動スキャン。勾配0.0001度……完璧な平面だ。',
      '自分の体長をミリ単位で計測中。成長率：昨日比+0.04mm。順調な拡大だ。',
      '目盛りに付着した微粒子を検知。即座に除去し、精密測定の精度を維持する。',
      'この定規が示す数値こそが客観的真実。感情的な曖昧さはここには存在しない。'
    ]
  },
  { 
    id: 'cabinet', 
    name: '防弾スチールキャビネット', 
    icon: '🗄️', 
    price: 50, 
    desc: '機密書類と飼育員観察ログを整然と施錠保管する鉄壁の箱。', 
    x: 14, 
    y: 76,
    interactionTexts: [
      '【機密分類】飼育員の行動ログを暗号化しキャビネットへ格納・施錠。',
      '鍵の耐破錠性をテスト中。物理的防御力（1F）は最高ランクだ。',
      '規律監査ファイルのインデックスを再構築。検索速度を0.05秒に短縮。',
      '重要機密「飼育員の弱点要因分析書」を最深部に保管完了。',
      '（ガチャリ）ダイヤルロック完了。暗号キーは私の脳内プロセッサのみに記憶。',
      '書類の角と引き出しの側枠を完全平行に格納。無駄な余白は生ませない。',
      'スチール板厚：3.2mm。外部からの物理的圧殺にも耐えうる防壁だ。',
      '（コンコン）叩いた反響音から内部の空密性をチェック。気密性99.8%を保持。'
    ]
  },
  { 
    id: 'cam_plant', 
    name: '監視カメラ内蔵観葉植物', 
    icon: '🪴', 
    price: 100, 
    desc: '光合成をしつつ飼育員の挙動を24時間ミリ単位で監視。', 
    x: 16, 
    y: 26,
    interactionTexts: [
      '【360度監視】観葉植物の死角なし。飼育員の視線ベクトルを追跡中。',
      '葉の葉脈構造に隠された光学センサーが正常稼働中。',
      '葉緑体による酸素供給と同時に、空間の不審動向を常時記録。',
      '光合成効率88.7%。二酸化炭素を吸収しつつ飼育員の心拍数を推定中。',
      '（ピピッ）飼育員がタップしようとする予兆動作（指の角度）を早期察知。',
      'レンズのホコリを自己洗浄。解像度4Kで領土侵略者を常時トラッキング。',
      '偽装植物としてのクオリティを定期点検。葉の緑色波長は天然植物と完全一致。',
      '「自然」を装いつつ「規律」を監視する。極めて合理的な防衛システムだ。'
    ]
  }
];

export interface ScheduleBlock {
  startHour: number;
  endHour: number;
  title: string;
  action: string;
  emoji: string;
  quotes: string[];
}

export const DAILY_SCHEDULE: ScheduleBlock[] = [
  {
    startHour: 7,
    endHour: 9,
    title: '朝の境界線監査 & 点呼',
    action: 'ケージの端から端まで1ミリの狂いもなく歩き、領域防衛ラインを確定中。',
    emoji: '🌅',
    quotes: [
      '「モゾ……朝会プロトコル開始。本日のノルマを厳格に履行せよ」',
      '「境界線に0.01mmのズレも許さん。これが我が領土だ」',
      '「朝の光の入射角を測定中。屈折率に異常なし」',
      '「07:00:00起動完了。外骨格の作動テスト良好、これより防衛ラインを確定する」',
      '「飼育員の起床時間とログインラグを記録中。本日の遅延：許容範囲内だ」',
      '「（モゾモゾ…）ケージ外周の直線距離を再計測。構造的ブレ、ゼロ」',
      '「朝の空気を換気中。酸素濃度20.9%……完璧な物理環境だ」',
      '「昨夜の侵入者（ホコリ）ゼロ。我が厳格な防衛体制の賜物だな」'
    ]
  },
  {
    startHour: 9,
    endHour: 11,
    title: '構造化業務 & 規律点検',
    action: 'エサの配置や家具の位置関係を論理的に整理し、ケージの秩序を最大化。',
    emoji: '📐',
    quotes: [
      '「家具の配置座標に乱れを発見。直ちに再配置を要求する」',
      '「エサのタンパク質と食物繊維の比率をグラフ化中……」',
      '「モゾ……ケージ内の動線効率が0.4%改善された」',
      '「曖昧な空間は混乱を招く。すべてのオブジェクトは定められたX・Y座標に存在すべきだ」',
      '「（カチカチ…）ケージ内の温湿度と空気対流速度をデータ化。規律通りの環境だ」',
      '「飼育員よ、作業の手を止めるな。空間の最適化に終わりはない」',
      '「無秩序な散らかしは万死に値する。整理整頓こそが最高度の快楽だ」',
      '「ミリ単位の並べ替えを完了。この美しき対称性を鑑賞したまえ」'
    ]
  },
  {
    startHour: 11,
    endHour: 12,
    title: '研究所占拠計画書（第47版）の推敲',
    action: 'ケージ外の全領域（研究所）を物理・空間支配するための軍事プロトコルを改訂中。',
    emoji: '📝',
    quotes: [
      '「【占拠計画第47版】飼育員の手の動きの死角を突くルートを修正中……」',
      '「第12フェーズ『スプレッドシート完全接収』のロジックに0.02%の隙を発見。即座に穴埋めする」',
      '「計画書第46版は甘かった。第47版では物理的侵略（1F）の圧力を30%増強する」',
      '「（カリカリ…）研究所の電源系統の遮断順序を算定。まずはWi-Fiルーターの物理占拠だ」',
      '「ふふ……この第47版計画書が完成した時、このケージの境界線は世界全体にまで拡大する」',
      '「（じーっ）飼育員が油断している隙に、キーボードの『Enterキー』を乗っ取る戦略だ」'
    ]
  },
  {
    startHour: 12,
    endHour: 13,
    title: '定刻消化プロトコル（昼食）',
    action: '補給された有機化合物を正確な時間配分で分解・吸収中。',
    emoji: '🥗',
    quotes: [
      '「12:00ジャスト。咀嚼回数と消化酵素の分泌速度を同期させる」',
      '「栄養補給は義務だ。感情ではなくエネルギー効率で摂取する」',
      '「味覚による快楽ではない。代謝プロセスの維持に必要な有機物質の投入だ」',
      '「1食あたりの摂取カロリー：規定値通り。午後の業務遂行に過不足なし」',
      '「（モグ…モグ…）一口あたり32回の咀嚼を実行中。消化管への負荷を最少化」',
      '「12:59:59。昼食プロトコル終了。これより午後の監査業務へ移行する」',
      '「水分補給完了。細胞の膨張率を規定値内に制御」'
    ]
  },
  {
    startHour: 13,
    endHour: 15,
    title: 'Fe感情演算プロトコル（共感の壁打ち練習）',
    action: '不気味な壁に向かって、不器用かつ必死に「人間への慰めと共感（Fe）」を練習中。',
    emoji: '🥺',
    quotes: [
      '「……それは失敗ではなく環境要因で……（ブツブツ……壁に向かって発話練習）」',
      '「……それは、失敗そのものより“再現性がない不安”が原因じゃない？（※分析） 」',
      '「ミスの確率を分解するとさ、環境要因と内部要因があって――（※論理講義になりかける）」',
      '「だから感情的に落ち込むのは統計的には自然で……（※共感しようとして確率論になる）」',
      '「（壁に向かって）……『大丈夫？』の適切なトーンと周波数を模索中。……これで合っているのか？」',
      '「うむ……感情の揺らぎに対する言語的デバッグ手順を検証している。不審がるな」',
      '「『共感』とは難しいな……相手の論理構造のバグを指摘するだけではダメなのか……？」',
      '「……よし、『よしよし（物理的接触によるなだめ行動）』の圧力加減をシミュレーション完了」'
    ]
  },
  {
    startHour: 15,
    endHour: 18,
    title: '飼育員ログ全数監査 & 法務点検',
    action: '飼育員のクリック頻度・マウス軌跡を暗号化して記録。規約違反を監視。',
    emoji: '⚖️',
    quotes: [
      '「飼育員のログイン履歴監査完了。不審なクリックはすべて記録済みだ」',
      '「ケージ利用規約第142条『過剰接触の禁止』の適用を検討中」',
      '「不規則なタップは規律の乱れだ。自制心を保ちたまえ」',
      '「無駄な連打行為を検知。過剰な感情表現は裁定の対象となる」',
      '「（カサカサ…）過去24時間の飼育員行動ログをスキャン。法規範への抵触、なし」',
      '「僕の領域に手を出すならば、まず『ケージ利用規約』全条文の暗唱を命じる」',
      '「クリック間隔のゆらぎから飼育員の疲労度を推定。……休んでもいいぞ（規約第88条）」'
    ]
  },
  {
    startHour: 18,
    endHour: 21,
    title: '夕刻の物理領域巡回 & トイ運動',
    action: 'ソファで反発係数を監査するか、ボールを蹴って力学を検証中。',
    emoji: '🛋️',
    quotes: [
      '「モゾ…【1F領域支配完了】構造化レザーの弾性を検証しつつ骨格を休息」',
      '「夜間警戒態勢へ移行。侵入者へのSe（外向感覚）圧力を高める」',
      '「運動量の消化と外骨格の強度テストを兼ねた運動を実施中」',
      '「夕刻の薄暗がりは境界線が曖昧になりやすい。空間スキャンを強化せよ」',
      '「（トントン…）壁面の強度確認。物理的打撃に対する防衛力ランク：S」',
      '「遊びではない。物理的接触による領土のコンディショニングだ」',
      '「運動エネルギーの放出により、夜間のスリープ品質が15%向上する計算だ」'
    ]
  },
  {
    startHour: 21,
    endHour: 24,
    title: '夜間セキュリティ監査 & 消灯準備',
    action: '全ログのバックアップを完了し、ケージの施錠状態を二重確認中。',
    emoji: '🌙',
    quotes: [
      '「本日の全イベントログをハッシュ化して保管完了」',
      '「明日の起床時間は07:00:00だ。0秒の遅延も認めない」',
      '「ケージの施錠確認：1回目完了。……念のため2回目の施錠確認を実行する」',
      '「照度の低下を観測。これより夜間省電力モードへの移行準備に入る」',
      '「本日の飼育員の行動スコア：84点。さらなる規律の遵守を期待する」',
      '「（じーっ）……施錠に狂いなし。これで夜間の物理安全は保障された」',
      '「『占拠計画書（第47版）』を金庫へ格納・暗号化。おやすみプロトコル準備」'
    ]
  },
  {
    startHour: 0,
    endHour: 7,
    title: '完全省電力スリープ（熟睡中）',
    action: '外骨格の代謝を最小化し、夢の中でも論理構造を最適化中。',
    emoji: '💤',
    quotes: [
      '「……（規則的な呼吸音。完全に眠っている）」',
      '「Zzz……論理積……境界線……Zzz」',
      '「むにゃ……侵入者……即時排除……規約第14条……Zzz」',
      '「Zzz……1ミリのズレも……許さ……ん……むにゃ」',
      '「……（すやすや…外骨格がかすかに上下している。完全に警戒を解いているようだ）」',
      '「Zzz……テディベアの充填率は……100％……合格……Zzz」',
      '「Zzz……失敗じゃなくて……環境要因……統計的には……自然で……むにゃ」',
      '「Zzz……第47版……研究所占拠……完了……Zzz」'
    ]
  }
];

export function isSleepingTime(date = new Date()): boolean {
  const h = date.getHours();
  return h >= 23 || h < 7;
}

export function getCurrentSchedule(date = new Date()): ScheduleBlock {
  const currentHour = date.getHours();
  if (isSleepingTime(date)) {
    return DAILY_SCHEDULE[DAILY_SCHEDULE.length - 1];
  }
  return (
    DAILY_SCHEDULE.find(s => currentHour >= s.startHour && currentHour < s.endHour) ||
    DAILY_SCHEDULE[DAILY_SCHEDULE.length - 1]
  );
}

export const FOOD_TYPES = [
  { id: 'cabbage', name: '有機キャベツ（食物繊維 / Se物理）', type: '🥬', exp: 10, points: 5, icon: '🥬', category: 'Se' },
  { id: 'apple', name: '高純度リンゴ果汁（糖質 / Ti論理）', type: '🍎', exp: 20, points: 10, icon: '🍎', category: 'Ti' },
  { id: 'glucose', name: '合成グルコース（即効性 / Ne電脳）', type: '🧪', exp: 35, points: 15, icon: '🧪', category: 'Ne' },
  { id: 'sugar', name: '角砂糖（情緒糖分 / Fe調和）', type: '🍬', exp: 25, points: 12, icon: '🍬', category: 'Fe' },
  { id: 'twig', name: '論理の小枝（高密度セルロース / 超構造化）', type: '🌿', exp: 40, points: 20, icon: '🌿', category: 'Ti' }
];

interface IntruderState {
  type: 'gohoubi' | 'darling';
  x: number;
  y: number;
  quote: string;
  soupPlaced?: boolean;
}

export default function CaterpillarRoom({ 
  onFeed, 
  stage, 
  formVariant = 'crystal',
  ownedFurniture,
  observationMode = false,
  customClerkImage = '',
  customGohoubiImage = '',
  onSquashed,
  onSquashLevelDown,
  onSquashStateChange,
  sprayCount = 0,
  onUseSpray,
  isDarlingIncident = false,
  darlingMoodTarget = 50,
  onResolveDarlingIncident
}: { 
  onFeed: (exp: number, foodName: string, foodId?: string) => void;
  stage: number;
  formVariant?: string;
  ownedFurniture: string[];
  observationMode?: boolean;
  customClerkImage?: string;
  customGohoubiImage?: string;
  onSquashed?: () => void;
  onSquashLevelDown?: (expPenalty: number, reason: string) => void;
  onSquashStateChange?: (squashed: boolean) => void;
  sprayCount?: number;
  onUseSpray?: () => void;
  isDarlingIncident?: boolean;
  darlingMoodTarget?: number;
  onResolveDarlingIncident?: (success: boolean) => void;
}) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [catPos, setCatPos] = useState<Position>({ x: 50, y: 50 });
  const [catTarget, setCatTarget] = useState<Position | null>(null);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [selectedFoodType, setSelectedFoodType] = useState<number>(0);
  const [facingRight, setFacingRight] = useState(false);
  const roomRef = useRef<HTMLDivElement>(null);

  // Ball toy state
  const [ballPos, setBallPos] = useState<Position>({ x: 48, y: 65 });
  const [ballVelocity, setBallVelocity] = useState<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const [ballRoll, setBallRoll] = useState(0);

  // 30 Taps Squash Mechanism
  const [squashHits, setSquashHits] = useState(0);
  const [isSquashed, setIsSquashed] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [squashSplat, setSquashSplat] = useState(false);

  // Random Intruders: Gohoubi & Darling-chan
  const [intruder, setIntruder] = useState<IntruderState | null>(null);

  // Darling Incident Guessing Game State
  const [guessInput, setGuessInput] = useState<string>('50');
  const [darlingHint, setDarlingHint] = useState<string | null>(null);
  const [darlingAttempts, setDarlingAttempts] = useState<number>(0);

  // Current Schedule
  const currentSchedule = getCurrentSchedule();
  const isSleepingNow = isSleepingTime();

  // Recover from squash
  const handleRecover = useCallback((customMsg?: string) => {
    setIsSquashed(false);
    setSquashHits(0);
    const msg = customMsg || 'モゾ…【構造再定義プロトコル完了】3次元立体の論理空間を再構築した。';
    setBubbleText(msg);
    if (onSquashStateChange) onSquashStateChange(false);
    setTimeout(() => setBubbleText(null), 3500);
  }, [onSquashStateChange]);

  // Auto restore timer for squash (10 seconds)
  useEffect(() => {
    if (!isSquashed) return;
    const timer = setTimeout(() => {
      handleRecover('モゾ……時間経過により3次元立体構造が自然復元した。');
    }, 10000);
    return () => clearTimeout(timer);
  }, [isSquashed, handleRecover]);

  // Random quotes in observation mode
  useEffect(() => {
    if (!observationMode || isSquashed || isDarlingIncident) return;
    const interval = setInterval(() => {
      const quotes = currentSchedule.quotes || ['「モゾ……規律を維持中」'];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      setBubbleText(q);
      setTimeout(() => setBubbleText(null), 4500);
    }, 8500);
    return () => clearInterval(interval);
  }, [observationMode, currentSchedule, isSquashed, isDarlingIncident]);

  // Ball rolling physics decay
  useEffect(() => {
    if (Math.abs(ballVelocity.vx) < 0.05 && Math.abs(ballVelocity.vy) < 0.05) return;
    const interval = setInterval(() => {
      setBallPos(prev => {
        let nx = prev.x + ballVelocity.vx;
        let ny = prev.y + ballVelocity.vy;
        let nvx = ballVelocity.vx * 0.92;
        let nvy = ballVelocity.vy * 0.92;

        if (nx < 12) { nx = 12; nvx = -nvx * 0.7; }
        if (nx > 88) { nx = 88; nvx = -nvx * 0.7; }
        if (ny < 18) { ny = 18; nvy = -nvy * 0.7; }
        if (ny > 82) { ny = 82; nvy = -nvy * 0.7; }

        setBallVelocity({ vx: nvx, vy: nvy });
        setBallRoll(r => r + (nvx + nvy) * 20);
        return { x: nx, y: ny };
      });
    }, 40);
    return () => clearInterval(interval);
  }, [ballVelocity]);

  // Auto-repel with Spray if owned
  const triggerSprayRepel = useCallback((targetName: string) => {
    if (sprayCount > 0 && onUseSpray) {
      onUseSpray();
      setBubbleText(`💨【防虫・規律スプレー発動！】侵入者（${targetName}）をシュッと即座に撃退！ (スプレー残: ${sprayCount - 1}回)`);
      setIntruder(null);
      setTimeout(() => setBubbleText(null), 4000);
      return true;
    }
    return false;
  }, [sprayCount, onUseSpray]);

  // Intruder spawning timer (Occasional Gohoubi or Darling-chan appearance)
  useEffect(() => {
    if (isDarlingIncident) return;
    const intruderTimer = setInterval(() => {
      if (intruder || isSquashed || isSleepingNow) return;
      
      // If player has spray, auto-repel!
      if (Math.random() < 0.35) {
        const isGohoubi = Math.random() < 0.5;
        if (sprayCount > 0) {
          triggerSprayRepel(isGohoubi ? 'ご褒美' : 'ダーリンちゃん');
          return;
        }

        if (isGohoubi) {
          const quotes = [
            '「芋虫殿〜！拙者の風呂上がりの出汁（豚骨仕立て）だゾ♡ 飲んでくれやんけ！」',
            '「拙者の出汁はコラーゲンたっぷりだゾ♡ ワシャワシャしたいやんけ！」',
            '「出汁置いていくゾ♡ 飲んでくれたら拙者大歓喜だゾ〜ッ！」'
          ];
          setIntruder({
            type: 'gohoubi',
            x: Math.random() * 50 + 25,
            y: Math.random() * 40 + 30,
            quote: quotes[Math.floor(Math.random() * quotes.length)],
            soupPlaced: true
          });
          setBubbleText('💥【警告】不審なオタク男子「ご褒美」の侵入を検知！ 豚骨出汁を飲まされる前にタップで追い払え！');
          setTimeout(() => setBubbleText(null), 5000);
        } else {
          const quotes = [
            '「へえ〜、その統制ロジック、ここ穴だらけやけど？w（芋虫の空間支配を嘲笑）」',
            '「ねぇダーリン♡ 自分では冷静なつもりでも、感情がログに漏れてる時あるよね♡」',
            '「あ……ダーリン見とったん？……なんや、完璧なナビゲーター演じるのも疲れるんよ。ウチ退屈やけん……」',
            '「ねぇダーリン♡ あなたは“簡単なこと”と“困難なこと”、どっちに惹かれるの？ ふふ♡」'
          ];
          setIntruder({
            type: 'darling',
            x: Math.random() * 50 + 25,
            y: Math.random() * 40 + 30,
            quote: quotes[Math.floor(Math.random() * quotes.length)]
          });
          setBubbleText('💥【警告】ILI「ダーリンちゃん」がケージを覗き見中！ タップして追い払え！');
          setTimeout(() => setBubbleText(null), 5000);
        }
      }
    }, 28000);

    return () => clearInterval(intruderTimer);
  }, [intruder, isSquashed, isSleepingNow, isDarlingIncident, sprayCount, triggerSprayRepel]);

  // Intruder removal on click
  const handleGohoubiClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIntruder(null);
    setBubbleText('モゾ…【Se領域防衛】ご褒美の風呂上がり出汁を物理排除した。ケージの規律を死守。');
    setTimeout(() => setBubbleText(null), 3500);
  };

  const handleDarlingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIntruder(null);
    setBubbleText('モゾ…【論理境界線復旧】ダーリンちゃんの嘲笑を遮断。感情的干渉を排除完了。');
    setTimeout(() => setBubbleText(null), 3500);
  };

  // Caterpillar click / Tap squash logic
  const handleCaterpillarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSleepingNow) {
      setBubbleText('💤【規律睡眠中】23:00〜07:00は省電力スリープ中です。睡眠中の物理接触はプロトコルにより禁止されています。');
      setTimeout(() => setBubbleText(null), 3500);
      return;
    }
    if (isSquashed || isDarlingIncident) return;

    const nextHits = squashHits + 1;
    setSquashHits(nextHits);

    // Screen Shake effect
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 200);

    if (nextHits >= 30) {
      // SQUASHED completely!
      setIsSquashed(true);
      setSquashSplat(true);
      setTimeout(() => setSquashSplat(false), 1500);

      const penaltyEXP = 25;
      if (onSquashLevelDown) {
        onSquashLevelDown(penaltyEXP, '30回過剰タップによる立体構造のペシャンコ崩壊');
      }
      if (onSquashed) {
        onSquashed();
      }
      if (onSquashStateChange) {
        onSquashStateChange(true);
      }

      setBubbleText('💥 ぐしゃあっ……！ 【構造崩壊】30回の過剰な物理圧力により外骨格がペシャンコに完全平面化（-25 EXP）……！');
      return;
    }

    // Reaction texts
    const countWarning = `（物理圧力: ${nextHits}/30回）`;
    const reactions = [
      `「モゾッ！ 過剰な物理干渉（Se）を検知！ 不可侵領土を侵犯するな！」 ${countWarning}`,
      `「痛覚プロトコル作動！ タップ圧力が許容値を超過しているぞ！」 ${countWarning}`,
      `「貴殿の指先ベクトルに悪意を検出。ケージ利用規約第14条違反だ！」 ${countWarning}`,
      `「骨格の構造耐性限界を警告する！ これ以上の圧力は立体構造を破壊する！」 ${countWarning}`,
      `「モゾ……！ 乱暴なタップは規律違反だ！ 穏やかに観察したまえ！」 ${countWarning}`
    ];
    setBubbleText(reactions[Math.floor(Math.random() * reactions.length)]);
    setTimeout(() => setBubbleText(null), 3500);
  };

  // Autonomous wandering
  useEffect(() => {
    if (isSquashed || isSleepingNow || isDarlingIncident) return;
    const interval = setInterval(() => {
      if (!catTarget && foods.length === 0 && Math.random() < 0.6) {
        const targetToy = ownedFurniture.includes('ball') && Math.random() < 0.4;
        if (targetToy) {
          setCatTarget({ x: ballPos.x + (Math.random() - 0.5) * 4, y: ballPos.y + (Math.random() - 0.5) * 4 });
        } else {
          setCatTarget({
            x: Math.random() * 70 + 15,
            y: Math.random() * 65 + 18
          });
        }
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [catTarget, foods, ownedFurniture, isSquashed, isSleepingNow, isDarlingIncident, ballPos]);

  // Movement loop
  useEffect(() => {
    if (isSquashed || isSleepingNow || isDarlingIncident) return;
    const interval = setInterval(() => {
      setCatPos(prev => {
        let target = catTarget;
        if (foods.length > 0) {
          target = foods[0].pos;
        }

        if (!target) return prev;

        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dx) > 1.2) {
          setFacingRight(dx > 0);
        }

        // Active Play collision with ball toy
        if (ownedFurniture.includes('ball')) {
          const distToBall = Math.sqrt(Math.pow(prev.x - ballPos.x, 2) + Math.pow(prev.y - ballPos.y, 2));
          if (distToBall < 6) {
            const speed = 3.5 + Math.random() * 2.5;
            const dirX = dx !== 0 ? (dx / Math.abs(dx)) : (Math.random() > 0.5 ? 1 : -1);
            const dirY = dy !== 0 ? (dy / Math.abs(dy)) : (Math.random() > 0.5 ? 1 : -1);
            
            setBallVelocity({ vx: dirX * speed, vy: dirY * speed });
            
            const ballComments = [
              '（コツン…！）運動量保存の法則に基づきボールを加速させた。',
              '（ポーン！）物理トイへの接触角45度。完全弾性衝突を観測。',
              'ボールの速度ベクトルを計算。ケージ内壁での反射角を予測中。',
              '自発的物理アクティビティ完了。骨格の敏捷性を確認。'
            ];
            setBubbleText(ballComments[Math.floor(Math.random() * ballComments.length)]);
            setTimeout(() => setBubbleText(null), 3500);
          }
        }

        // Check collision with Gohoubi soup (Penalty if not chased away!)
        if (intruder && intruder.type === 'gohoubi' && intruder.soupPlaced) {
          const distToSoup = Math.sqrt(Math.pow(prev.x - intruder.x, 2) + Math.pow(prev.y - intruder.y, 2));
          if (distToSoup < 5) {
            setBubbleText('モゾ…うぐっ…！ ご褒美の風呂上がり豚骨出汁を摂取してしまった……！ 油分過多で規律が崩壊（EXP低下）……！');
            if (onSquashLevelDown) {
              onSquashLevelDown(30, 'ご褒美の風呂上がり出汁摂取による規律崩壊');
            }
            setIntruder(null);
            setTimeout(() => setBubbleText(null), 4500);
          }
        }

        if (dist < 3) {
          if (foods.length > 0) {
            const eaten = foods[0];
            setFoods(f => f.slice(1));
            
            const comments = [
              `モゾ…「${eaten.name}」の分子結合を承認。`,
              '（咀嚼音）……細胞膜の強度を確認。',
              '摂取完了。境界線防衛エネルギーに変換。',
              '栄養バランスを再計算。規律通りに消化する。'
            ];
            const comment = comments[Math.floor(Math.random() * comments.length)];
            setBubbleText(comment);
            setTimeout(() => setBubbleText(null), 3500);

            setTimeout(() => {
              onFeed(eaten.exp, eaten.name, eaten.type);
            }, 0);
          } else {
            const nearbyFurn = AVAILABLE_FURNITURE.find(
              f => ownedFurniture.includes(f.id) && Math.sqrt(Math.pow(f.x - target.x, 2) + Math.pow(f.y - (target.y - 4), 2)) < 7
            );
            if (nearbyFurn && Math.random() < 0.75) {
              const texts = nearbyFurn.interactionTexts || [nearbyFurn.desc];
              const randomText = texts[Math.floor(Math.random() * texts.length)];
              setBubbleText(randomText);
              setTimeout(() => setBubbleText(null), 4000);
            }
          }

          setCatTarget(null);
          return target;
        }

        return {
          x: prev.x + (dx / dist) * 0.95,
          y: prev.y + (dy / dist) * 0.95
        };
      });
    }, 40);
    return () => clearInterval(interval);
  }, [catTarget, foods, onFeed, ownedFurniture, isSquashed, isSleepingNow, isDarlingIncident, ballPos, intruder, onSquashLevelDown]);

  // Drop food on click
  const dropFood = (e: React.MouseEvent) => {
    if (isSleepingNow) {
      setBubbleText('💤【規律睡眠中】23:00〜07:00は完全省電力スリープ中です。エサやり・タップ操作はプロトコルにより禁止されています。');
      setTimeout(() => setBubbleText(null), 3500);
      return;
    }
    if (!roomRef.current || isSquashed || isDarlingIncident) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (y > 85 || y < 12 || x < 10 || x > 90) return;

    const currentFood = FOOD_TYPES[selectedFoodType];
    setFoods(prev => [
      ...prev, 
      { 
        id: Date.now() + Math.random(), 
        pos: { x, y }, 
        type: currentFood.type, 
        name: currentFood.name, 
        exp: currentFood.exp 
      }
    ]);
  };

  // Stage emoji mappings (Stage 0 - 5)
  const getStageEmoji = () => {
    if (stage === 0) return '🐛';
    if (stage === 1) return '🐛'; // 規律の幼虫・課長級
    if (stage === 2) return '🐛'; // 法務統制芋虫（Ti-Se監査型）
    if (stage === 3) return '🐛'; // 直角幾何学エリート芋虫
    if (stage === 4) return '🛡️'; // 立方体クリスタルさなぎ（完全防壁シェルター・Stage4のみ蛹）
    if (stage >= 5) return '🦋'; // 構造化アゲハ完全体（領域展開・絶対秩序蝶）
    return '🐛';
  };

  // Darling Guess Mood Handler (Supports decimal accuracy!)
  const handleDarlingGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(guessInput);
    if (isNaN(val) || val < 1 || val > 100) return;

    setDarlingAttempts(a => a + 1);

    const diff = Math.abs(val - darlingMoodTarget);

    if (diff < 0.05) {
      setDarlingHint(`🎯 ピタリ正解！（機嫌: ${darlingMoodTarget}） 「しゃーないな、ダーリン♡ ちゃんとウチの機嫌分かってくれたけん芋虫ちゃん返したるわ♡」`);
      setTimeout(() => {
        if (onResolveDarlingIncident) onResolveDarlingIncident(true);
      }, 2500);
    } else if (val < darlingMoodTarget) {
      if (diff >= 5) {
        setDarlingHint(`「ウチの機嫌、そんな低ないわ♡ もっともっと上やで？（${val}より5以上高い）」`);
      } else if (diff >= 1) {
        setDarlingHint(`「ん〜惜しいけどまだ低いで！ もうちょい上や！（${val}より1〜5高い）」`);
      } else {
        setDarlingHint(`「ぐぬぬ……！ 激惜しいやんけ！ あとコンマ数％上やで！？（${val}より0.1〜1高い）」`);
      }
    } else {
      if (diff >= 5) {
        setDarlingHint(`「ウチの機嫌、そこまで高ぶってへんわ♡ もっともっと下やで？（${val}より5以上低い）」`);
      } else if (diff >= 1) {
        setDarlingHint(`「ちょっと買い被りすぎや！ もうちょい下やで！（${val}より1〜5低い）」`);
      } else {
        setDarlingHint(`「ぐぬぬ……！ 激惜しいやんけ！ あとコンマ数％下やで！？（${val}より0.1〜1低い）」`);
      }
    }
  };

  // Spray is useless against Darling-chan incident (Preserves Daycare value)
  const handleSprayDispelDarling = () => {
    setDarlingHint('💨 スプレー噴射！……しかしダーリンちゃんには全く効かない！「そんな安物スプレー効くわけないやん♡ 保育園に預けとかんからやで？w」');
  };

  return (
    <div className={`flex flex-col gap-2.5 w-full h-full relative ${shakeScreen ? 'animate-shake' : ''}`}>
      
      {/* Observation Banner if in observation mode */}
      {observationMode && !isDarlingIncident && (
        <div className="bg-emerald-900 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm border border-emerald-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentSchedule.emoji}</span>
            <span>現在: <strong>{currentSchedule.title}</strong></span>
          </div>
          <span className="text-[11px] text-emerald-200">{currentSchedule.action}</span>
        </div>
      )}

      {/* Cage Canvas */}
      <div 
        className="relative w-full flex-1 min-h-[360px] bg-stone-50 border-2 border-stone-300 rounded-2xl cursor-crosshair shadow-inner select-none transition-all overflow-hidden" 
        ref={roomRef} 
        onClick={dropFood}
      >
        {/* Glass Crack Overlays based on squash hits or incident */}
        {(squashHits > 5 || isDarlingIncident) && (
          <div 
            className="absolute inset-0 pointer-events-none z-30 opacity-40 rounded-2xl transition-opacity duration-300"
            style={{
              backgroundImage: (squashHits >= 25 || isDarlingIncident)
                ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 10%, transparent 60%), linear-gradient(45deg, transparent 48%, rgba(239, 68, 68, 0.4) 50%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(239, 68, 68, 0.4) 50%, transparent 52%)'
                : squashHits >= 15
                ? 'linear-gradient(45deg, transparent 48%, rgba(200, 200, 200, 0.6) 50%, transparent 52%), linear-gradient(-30deg, transparent 48%, rgba(200, 200, 200, 0.6) 50%, transparent 52%)'
                : 'linear-gradient(45deg, transparent 49%, rgba(180, 180, 180, 0.4) 50%, transparent 51%)'
            }}
          />
        )}

        {/* Floor Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none rounded-2xl" 
          style={{ 
            backgroundImage: 'linear-gradient(#a8a29e 1px, transparent 1px), linear-gradient(90deg, #a8a29e 1px, transparent 1px)', 
            backgroundSize: '36px 36px' 
          }}
        />

        {/* Territory Perimeter Lines (LSI Aesthetic) */}
        <div className="absolute inset-2 border-2 border-dashed border-emerald-500/30 rounded-xl pointer-events-none" />

        {/* Top Info & Status */}
        <div className="absolute top-3 left-4 text-[11px] font-black text-stone-500 pointer-events-none z-20 flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-800 bg-white/90 px-2.5 py-1 rounded-lg shadow-xs border border-emerald-100">
            <span>🧪 統制ケージ [1F/Se領域]</span>
          </span>
          {squashHits > 0 && !isSquashed && !isDarlingIncident && (
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200 animate-pulse flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>物理圧力: {squashHits}/30 (30回でペシャンコ＆EXP低下)</span>
            </span>
          )}
          {isSleepingNow && !isDarlingIncident && (
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-200 flex items-center gap-1">
              <span>💤 完全省電力熟睡中（移動停止）</span>
            </span>
          )}
          {sprayCount > 0 && (
            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-200 flex items-center gap-1">
              <Wind className="w-3 h-3" />
              <span>スプレー防衛: {sprayCount}回</span>
            </span>
          )}
        </div>

        {/* Restore button if squashed */}
        {isSquashed && !isDarlingIncident && (
          <div className="absolute top-3 right-3 z-30">
            <button
              onClick={() => handleRecover()}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-black py-1.5 px-3 rounded-xl shadow-lg border border-white text-xs flex items-center gap-1.5 transition active:scale-95 animate-pulse cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>📐 構造再定義（立体復旧）</span>
            </button>
          </div>
        )}

        {/* Render Owned Furniture */}
        {!isDarlingIncident && AVAILABLE_FURNITURE.filter(f => ownedFurniture.includes(f.id)).map(item => {
          const posX = item.id === 'ball' ? ballPos.x : item.x;
          const posY = item.id === 'ball' ? ballPos.y : item.y;

          return (
            <div
              key={item.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10 group transition-all duration-200"
              style={{ left: `${posX}%`, top: `${posY}%` }}
            >
              <div className="absolute -inset-2 bg-emerald-900/10 rounded-2xl blur-xs -z-10" />
              
              <motion.div 
                className="text-4xl sm:text-5xl filter drop-shadow-md cursor-pointer pointer-events-auto hover:scale-110 transition-transform"
                style={item.id === 'ball' ? { rotate: `${ballRoll}deg` } : {}}
                whileHover={{ scale: 1.15 }}
                onClick={() => {
                  if (item.id === 'ball') {
                    const kickX = (Math.random() - 0.5) * 8;
                    const kickY = (Math.random() - 0.5) * 8;
                    setBallVelocity({ vx: kickX, vy: kickY });
                    setBubbleText('（コロコロ……！）ボールをクリックして物理慣性を与えた。');
                    setTimeout(() => setBubbleText(null), 3000);
                  } else {
                    const texts = item.interactionTexts || [item.desc];
                    const randomT = texts[Math.floor(Math.random() * texts.length)];
                    setBubbleText(randomT);
                    setTimeout(() => setBubbleText(null), 3500);
                  }
                }}
              >
                {item.icon}
              </motion.div>

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none">
                {item.name}
              </div>
            </div>
          );
        })}

        {/* Intruder: Gohoubi */}
        <AnimatePresence>
          {!isDarlingIncident && intruder && intruder.type === 'gohoubi' && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-35 cursor-pointer select-none group"
              style={{ left: `${intruder.x}%`, top: `${intruder.y}%` }}
              onClick={handleGohoubiClick}
              title="タップしてご褒美を追い払う！（放置すると出汁を飲まされてEXP低下）"
            >
              <div className="relative flex flex-col items-center">
                <div className="mb-1 bg-pink-600 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-lg border border-white whitespace-nowrap animate-bounce">
                  {intruder.quote}
                </div>
                
                <div className="relative w-16 h-16 rounded-full bg-pink-100 border-2 border-pink-400 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform overflow-hidden">
                  {customGohoubiImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={customGohoubiImage} alt="ご褒美" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">🐷🍨</span>
                  )}
                  <span className="absolute bottom-0 text-[9px] bg-pink-700 text-white px-1 rounded-t font-black">ご褒美</span>
                </div>

                <div className="mt-1 text-2xl animate-pulse">🍲</div>
                <div className="text-[9px] font-black text-red-600 bg-white/90 px-1.5 py-0.5 rounded shadow-xs border border-red-200">
                  ⚠️ タップで追放！
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intruder: Normal Darling-chan */}
        <AnimatePresence>
          {!isDarlingIncident && intruder && intruder.type === 'darling' && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-35 cursor-pointer select-none group"
              style={{ left: `${intruder.x}%`, top: `${intruder.y}%` }}
              onClick={handleDarlingClick}
              title="タップしてダーリンちゃんの煽りを追い払う！"
            >
              <div className="relative flex flex-col items-center">
                <div className="mb-1 bg-indigo-900 text-indigo-100 text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg border border-indigo-400 max-w-[240px] text-center leading-tight">
                  {intruder.quote}
                </div>
                
                <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-indigo-400 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
                  <span className="text-4xl">🥺</span>
                </div>
                <span className="text-[9px] font-black text-indigo-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs mt-0.5">
                  ILI ダーリンちゃん
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating food items */}
        <AnimatePresence>
          {!isDarlingIncident && foods.map(f => (
            <motion.div 
              key={f.id}
              initial={{ scale: 0, y: -30, rotate: -20 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute text-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md z-20"
              style={{ left: `${f.pos.x}%`, top: `${f.pos.y}%` }}
            >
              {f.type}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Normal Caterpillar & Bubble (Hidden during Darling Incident) */}
        {!isDarlingIncident && (
          <div 
            className="absolute transition-all duration-75 -translate-x-1/2 -translate-y-1/2 z-40 cursor-pointer"
            style={{ left: `${catPos.x}%`, top: `${catPos.y}%` }}
            onClick={handleCaterpillarClick}
            title="クリック/タップして物理干渉（30回でペシャンコ）"
          >
            {/* Bubble */}
            <AnimatePresence>
              {bubbleText && (
                <motion.div 
                  initial={{ opacity: 0, y: catPos.y < 35 ? -10 : 10, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className={`absolute left-1/2 -translate-x-1/2 ${
                    catPos.y < 35 ? 'top-full mt-3' : 'bottom-full mb-3'
                  } bg-stone-900 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl pointer-events-none z-50 border-2 border-emerald-500/60 w-max max-w-[280px] sm:max-w-[340px] text-center whitespace-pre-wrap break-words leading-relaxed`}
                >
                  {bubbleText}
                  <div 
                    className={`absolute left-1/2 -translate-x-1/2 border-6 border-transparent ${
                      catPos.y < 35 
                        ? 'bottom-full border-b-stone-900' 
                        : 'top-full border-t-stone-900'
                    }`} 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Caterpillar / Cocoon Body */}
            <motion.div 
              className="inline-block select-none origin-bottom relative"
              animate={
                isSquashed
                  ? {
                      scaleY: 0.08,
                      scaleX: (facingRight ? -1 : 1) * 2.8,
                      y: 18,
                      rotate: 4,
                      filter: 'brightness(0.8) saturate(1.4) drop-shadow(0 2px 4px rgba(0,0,0,0.6))'
                    }
                  : {
                      scaleY: Math.max(0.35, 1 - (squashHits / 30) * 0.65),
                      scaleX: (facingRight ? -1 : 1) * (1 + (squashHits / 30) * 0.8),
                      y: !isSleepingNow && (catTarget || foods.length > 0) ? [-2, 0, -2] : 0,
                      rotate: !isSleepingNow && (catTarget || foods.length > 0) ? [-3, 3, -3] : 0,
                      filter: squashHits > 0 ? 'brightness(0.9) saturate(1.2)' : 'none'
                    }
              }
              transition={{
                scaleY: { type: 'spring', stiffness: 450, damping: 25 },
                scaleX: { type: 'spring', stiffness: 450, damping: 25 },
                rotate: { repeat: !isSquashed && (catTarget || foods.length > 0) ? Infinity : 0, duration: 0.5 },
                y: { repeat: !isSquashed && (catTarget || foods.length > 0) ? Infinity : 0, duration: 0.5 }
              }}
            >
              {/* Floor squash shadow */}
              {isSquashed && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 h-4 bg-emerald-950/40 rounded-full blur-xs pointer-events-none -z-10" />
              )}

              <div className="relative select-none flex items-center justify-center">
                {stage === 4 ? (
                  <div className="inline-block">
                    <ChrysalisSVG variant={formVariant} size={68} />
                  </div>
                ) : (
                  <span className="text-6xl inline-block select-none leading-none transform origin-bottom">
                    {getStageEmoji()}
                  </span>
                )}
                {isSquashed && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                    <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full shadow-md animate-pulse whitespace-nowrap scale-y-[12.5] scale-x-[0.35]">
                      💥 完全平面化
                    </span>
                  </div>
                )}
                {isSleepingNow && !isSquashed && (
                  <span className="absolute -top-3 -right-2 text-xl animate-pulse">💤</span>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* -------------------------------------------------------------
            DARLING-CHAN NEGLECT INCIDENT OVERLAY (3-DAY INACTIVITY)
        ------------------------------------------------------------- */}
        {isDarlingIncident && (
          <div className="absolute inset-0 z-50 bg-indigo-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
            
            <div className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full animate-bounce shadow-md flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>🚨【警告】放置による物理崩壊インシデント発生！</span>
            </div>

            {/* Darling Visual */}
            <motion.div
              initial={{ scale: 0.5, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative my-2"
            >
              <div className="w-24 h-24 rounded-full bg-indigo-900 border-4 border-rose-400 flex items-center justify-center text-7xl shadow-2xl animate-pulse">
                🥺
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                ILI ダーリンちゃん
              </span>
            </motion.div>

            {/* Dialogue */}
            <div className="bg-stone-900 border-2 border-indigo-400 rounded-2xl p-3.5 max-w-sm w-full my-2 text-left shadow-xl">
              <p className="text-xs sm:text-sm text-pink-300 font-bold leading-relaxed mb-2">
                「ダーリン♡ 芋虫ちゃん？ ウチが踏みつぶしてどっか行っちゃったで？w<br/>
                1〜100（小数可）でウチの機嫌当ててくれたら、許して返したるわ🥺♡」
              </p>
              {darlingHint && (
                <div className="bg-indigo-900/90 border border-indigo-400 text-indigo-100 text-xs font-bold p-2 rounded-xl text-center animate-pulse">
                  {darlingHint}
                </div>
              )}
            </div>

            {/* Guess Input Form */}
            <form onSubmit={handleDarlingGuessSubmit} className="flex gap-2 max-w-xs w-full justify-center">
              <input
                type="number"
                step="0.1"
                min={1}
                max={100}
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="例: 42.5"
                className="w-28 bg-white border-2 border-indigo-400 rounded-xl px-3 py-2 text-center text-base font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
              >
                機嫌を推測（{darlingAttempts}回目）
              </button>
            </form>

            {/* Spray Repel Test - Displays useless message to preserve Daycare */}
            {sprayCount > 0 && (
              <button
                type="button"
                onClick={handleSprayDispelDarling}
                className="mt-2.5 bg-stone-700 hover:bg-stone-600 text-stone-200 font-black text-xs px-4 py-2 rounded-xl shadow-md border border-stone-500 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Wind className="w-4 h-4" />
                <span>💨 スプレーを噴射してみる（※ダーリンちゃんには無効）</span>
              </button>
            )}

            {/* Give up option */}
            <button
              type="button"
              onClick={() => {
                if (onResolveDarlingIncident) onResolveDarlingIncident(false);
              }}
              className="mt-3 text-[11px] text-stone-400 hover:text-stone-200 underline cursor-pointer"
            >
              救出を諦めて最初から育て直す（Lv1初期化）
            </button>

          </div>
        )}

        {/* Squashed Flat Splat Overlay Particle */}
        <AnimatePresence>
          {squashSplat && (
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none z-50 text-6xl font-black"
              style={{ left: `${catPos.x}%`, top: `${catPos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              💥
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Food Selector Toolbar */}
      {!isDarlingIncident && (
        <div className="flex items-center justify-between gap-2 bg-stone-100 p-2.5 rounded-xl border border-stone-200">
          <span className="text-xs font-bold text-stone-500 pl-1 shrink-0">補給エサ:</span>
          <div className="flex gap-2 overflow-x-auto py-0.5">
            {FOOD_TYPES.map((ft, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFoodType(idx)}
                disabled={isSquashed || isSleepingNow}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer ${
                  selectedFoodType === idx
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                } ${isSquashed || isSleepingNow ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{ft.icon}</span>
                <span>{ft.name.split('（')[0]}</span>
                <span className="text-[10px] opacity-80">+{ft.exp}EXP</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
