'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Share2, 
  Check, 
  MessageSquareHeart, 
  BrainCircuit, 
  ArrowLeft, 
  ChevronRight, 
  Award,
  Sparkles,
  Flame,
  ShieldAlert
} from 'lucide-react';

/* -------------------------------------------------------------
   1. 物理・反射（Se）：「規律即時履行」
------------------------------------------------------------- */
type ReflexGameType = 
  | 'target' 
  | 'even' 
  | 'odd'
  | 'sequence_asc' 
  | 'sequence_desc' 
  | 'biggest' 
  | 'smallest' 
  | 'color_match' 
  | 'odd_one_out'
  | 'boundary_side'
  | 'not_condition';

function ReflexGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(4.2);
  const [currentGame, setCurrentGame] = useState<ReflexGameType>('target');
  const [isGameOver, setIsGameOver] = useState(false);
  
  // States
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [numbers, setNumbers] = useState<number[]>([1, 3, 5, 2]);
  const [targetSequence, setTargetSequence] = useState<number[]>([10, 20, 30, 40]);
  const [shuffledSeqButtons, setShuffledSeqButtons] = useState<number[]>([30, 10, 40, 20]);
  const [currentSeqIdx, setCurrentSeqIdx] = useState(0);
  const [shapes, setShapes] = useState<{ id: number; size: number; x: number; y: number }[]>([
    { id: 0, size: 32, x: 26, y: 30 },
    { id: 1, size: 46, x: 74, y: 30 },
    { id: 2, size: 62, x: 28, y: 74 },
    { id: 3, size: 80, x: 72, y: 74 }
  ]);
  const [correctShapeIdx, setCorrectShapeIdx] = useState(3);
  const [targetColor, setTargetColor] = useState<{ name: string; hex: string; bg: string }>({ name: '赤 (RED)', hex: '#ef4444', bg: 'bg-red-500 hover:bg-red-600' });
  const [colorOptions, setColorOptions] = useState<{ id: number; name: string; bg: string }[]>([
    { id: 0, name: '赤 (RED)', bg: 'bg-red-500 hover:bg-red-600' },
    { id: 1, name: '青 (BLUE)', bg: 'bg-blue-500 hover:bg-blue-600' },
    { id: 2, name: '緑 (GREEN)', bg: 'bg-emerald-500 hover:bg-emerald-600' },
    { id: 3, name: '黄 (YELLOW)', bg: 'bg-amber-400 hover:bg-amber-500' }
  ]);
  const [oddOptions, setOddOptions] = useState<{ id: number; icon: string; isOdd: boolean }[]>([
    { id: 0, icon: '📐', isOdd: false },
    { id: 1, icon: '📐', isOdd: false },
    { id: 2, icon: '📐', isOdd: false },
    { id: 3, icon: '☕', isOdd: true }
  ]);
  const [boundaryTargetSide, setBoundaryTargetSide] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [notCondition, setNotCondition] = useState<{ text: string; correctId: number; options: { id: number; label: string; icon: string }[] }>({
    text: '「🐛 幼虫」ではないものを選択せよ！',
    correctId: 2,
    options: [
      { id: 0, label: '幼虫A', icon: '🐛' },
      { id: 1, label: '幼虫B', icon: '🐛' },
      { id: 2, label: '完全体', icon: '🦋' },
      { id: 3, label: '幼虫C', icon: '🐛' }
    ]
  });

  const isInitialized = useRef(false);

  const startNextProblem = useCallback((currentScore: number) => {
    const types: ReflexGameType[] = [
      'target', 
      'even', 
      'odd',
      'sequence_asc', 
      'sequence_desc', 
      'biggest', 
      'smallest', 
      'color_match', 
      'odd_one_out',
      'boundary_side',
      'not_condition'
    ];
    const selected = types[Math.floor(Math.random() * types.length)];
    setCurrentGame(selected);
    
    // Dynamic countdown
    const newTime = Math.max(1.8, 4.2 - currentScore * 0.08);
    setTimeRemaining(newTime);

    if (selected === 'target') {
      setTargetPos({ 
        x: Math.floor(Math.random() * 60 + 20), 
        y: Math.floor(Math.random() * 60 + 20) 
      });
    } else if (selected === 'even') {
      const odds = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23].sort(() => Math.random() - 0.5);
      const evens = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].sort(() => Math.random() - 0.5);
      const nums = [odds[0], odds[1], odds[2], evens[0]].sort(() => Math.random() - 0.5);
      setNumbers(nums);
    } else if (selected === 'odd') {
      const odds = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23].sort(() => Math.random() - 0.5);
      const evens = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].sort(() => Math.random() - 0.5);
      const nums = [evens[0], evens[1], evens[2], odds[0]].sort(() => Math.random() - 0.5);
      setNumbers(nums);
    } else if (selected === 'sequence_asc' || selected === 'sequence_desc') {
      const pool = Array.from({ length: 90 }, (_, i) => i + 10).sort(() => Math.random() - 0.5).slice(0, 4);
      const sorted = [...pool].sort((a, b) => selected === 'sequence_asc' ? a - b : b - a);
      setTargetSequence(sorted);
      setShuffledSeqButtons([...pool].sort(() => Math.random() - 0.5));
      setCurrentSeqIdx(0);
    } else if (selected === 'biggest' || selected === 'smallest') {
      const sizes = [32, 46, 62, 80].sort(() => Math.random() - 0.5);
      const targetSize = selected === 'biggest' ? Math.max(...sizes) : Math.min(...sizes);
      setCorrectShapeIdx(sizes.indexOf(targetSize));
      
      const positions = [
        { x: 26, y: 30 },
        { x: 74, y: 30 },
        { x: 28, y: 74 },
        { x: 72, y: 74 }
      ];
      setShapes(sizes.map((s, idx) => ({
        id: idx,
        size: s,
        x: positions[idx].x,
        y: positions[idx].y
      })));
    } else if (selected === 'color_match') {
      const allColors = [
        { name: '赤 (RED)', hex: '#ef4444', bg: 'bg-red-500 hover:bg-red-600' },
        { name: '青 (BLUE)', hex: '#3b82f6', bg: 'bg-blue-500 hover:bg-blue-600' },
        { name: '緑 (GREEN)', hex: '#10b981', bg: 'bg-emerald-500 hover:bg-emerald-600' },
        { name: '黄 (YELLOW)', hex: '#eab308', bg: 'bg-amber-400 hover:bg-amber-500' }
      ].sort(() => Math.random() - 0.5);
      setTargetColor(allColors[0]);
      setColorOptions(allColors.map((c, i) => ({ id: i, name: c.name, bg: c.bg })));
    } else if (selected === 'odd_one_out') {
      const sets = [
        { common: '📐', odd: '☕' },
        { common: '🐛', odd: '🦋' },
        { common: '⚖️', odd: '💣' },
        { common: '🗄️', odd: '🪴' },
        { common: '🧸', odd: '⚽' }
      ];
      const currentSet = sets[Math.floor(Math.random() * sets.length)];
      const items = [
        { id: 0, icon: currentSet.common, isOdd: false },
        { id: 1, icon: currentSet.common, isOdd: false },
        { id: 2, icon: currentSet.common, isOdd: false },
        { id: 3, icon: currentSet.odd, isOdd: true }
      ].sort(() => Math.random() - 0.5);
      setOddOptions(items);
    } else if (selected === 'boundary_side') {
      const side = Math.random() > 0.5 ? 'LEFT' : 'RIGHT';
      setBoundaryTargetSide(side);
    } else if (selected === 'not_condition') {
      const notCases = [
        {
          text: '「🐛 幼虫」ではないものを選択せよ！',
          correctId: 2,
          options: [
            { id: 0, label: '幼虫A', icon: '🐛' },
            { id: 1, label: '幼虫B', icon: '🐛' },
            { id: 2, label: '完全体', icon: '🦋' },
            { id: 3, label: '幼虫C', icon: '🐛' }
          ]
        },
        {
          text: '「☕ 珈琲」ではないものを選択せよ！',
          correctId: 1,
          options: [
            { id: 0, label: '珈琲', icon: '☕' },
            { id: 1, label: '定規', icon: '📐' },
            { id: 2, label: '珈琲', icon: '☕' },
            { id: 3, label: '珈琲', icon: '☕' }
          ]
        }
      ];
      const selectedCase = notCases[Math.floor(Math.random() * notCases.length)];
      setNotCondition({
        text: selectedCase.text,
        correctId: selectedCase.correctId,
        options: [...selectedCase.options].sort(() => Math.random() - 0.5)
      });
    }
  }, []);

  const handleSuccess = () => {
    if (isGameOver) return;
    const newScore = score + 1;
    setScore(newScore);
    startNextProblem(newScore);
  };

  const handleFail = () => {
    if (isGameOver) return;
    setIsGameOver(true);
  };

  // Timer loop
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isGameOver]);

  // Handle Game Over safely
  useEffect(() => {
    if (isGameOver) {
      onFinish(score);
    }
  }, [isGameOver, score, onFinish]);

  // Initial problem setup safely
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      const timeout = setTimeout(() => {
        startNextProblem(0);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [startNextProblem]);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Status Bar */}
      <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-stone-400">SCORE</span>
          <span className="text-xl font-black text-emerald-700">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-stone-400">残り時間</span>
          <span className={`text-base font-black font-mono px-2.5 py-0.5 rounded ${timeRemaining < 1.5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-stone-100 text-stone-800'}`}>
            {timeRemaining.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Mission Instruction */}
      <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3 py-2 rounded-xl text-center font-black text-xs sm:text-sm shadow-xs min-h-[44px] flex items-center justify-center">
        {currentGame === 'target' && "🚨【緊急検知】不正アクセスポイントを直ちに遮断せよ！"}
        {currentGame === 'even' && "📊【構造分類】偶数データのみをコンテナに移送せよ！"}
        {currentGame === 'odd' && "⚡【異常値抽出】奇数データのみを瞬時に選択せよ！"}
        {currentGame === 'sequence_asc' && `📋【手順遵守】昇順（小さい順）にタップせよ！ 次: [${targetSequence[currentSeqIdx]}]`}
        {currentGame === 'sequence_desc' && `🔢【逆順監査】降順（大きい順）にタップせよ！ 次: [${targetSequence[currentSeqIdx]}]`}
        {currentGame === 'biggest' && "📐【空間支配・最大】領域最大オブジェクトを選択せよ！"}
        {currentGame === 'smallest' && "🔻【空間支配・最小】領域最小オブジェクトを選択せよ！"}
        {currentGame === 'color_match' && `🎨【色彩統制】指定色「${targetColor.name}」のみを瞬時に選択せよ！`}
        {currentGame === 'odd_one_out' && "⚡【不正規律検知】1つだけ異なる「仲間外れ」を排除せよ！"}
        {currentGame === 'boundary_side' && `⚖️【境界線判定】中央境界線の【${boundaryTargetSide === 'LEFT' ? '👈 左領域' : '👉 右領域'}】を叩け！`}
        {currentGame === 'not_condition' && `🚫【論理否定監査】${notCondition.text}`}
      </div>

      {/* Interactive Game Area */}
      <div className="relative w-full h-[270px] bg-white border-2 border-stone-200 rounded-xl overflow-hidden shadow-inner">
        {/* 1. Target */}
        {currentGame === 'target' && (
          <button 
            onClick={handleSuccess}
            className="absolute w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-2xl animate-bounce active:scale-90 transition-transform cursor-pointer border-2 border-white"
            style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
          >
            🚨
          </button>
        )}

        {/* 2. Even numbers */}
        {currentGame === 'even' && (
          <div className="grid grid-cols-2 gap-3 h-full p-4">
            {numbers.map((n, i) => (
              <button 
                key={i}
                onClick={() => n % 2 === 0 ? handleSuccess() : handleFail()}
                className="bg-stone-100 hover:bg-emerald-100 hover:border-emerald-400 border-2 border-stone-200 text-stone-800 text-3xl font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center"
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {/* 3. Odd numbers */}
        {currentGame === 'odd' && (
          <div className="grid grid-cols-2 gap-3 h-full p-4">
            {numbers.map((n, i) => (
              <button 
                key={i}
                onClick={() => n % 2 !== 0 ? handleSuccess() : handleFail()}
                className="bg-stone-100 hover:bg-amber-100 hover:border-amber-400 border-2 border-stone-200 text-stone-800 text-3xl font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center"
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {/* 4. Sequence Ascending / Descending */}
        {(currentGame === 'sequence_asc' || currentGame === 'sequence_desc') && (
          <div className="grid grid-cols-2 gap-3 h-full p-4">
            {shuffledSeqButtons.map((n) => {
              const targetNum = targetSequence[currentSeqIdx];
              const isDone = targetSequence.indexOf(n) < currentSeqIdx;
              return (
                <button 
                  key={n}
                  onClick={() => {
                    if (n === targetNum) {
                      if (currentSeqIdx === targetSequence.length - 1) {
                        handleSuccess();
                      } else {
                        setCurrentSeqIdx(s => s + 1);
                      }
                    } else {
                      handleFail();
                    }
                  }}
                  disabled={isDone}
                  className={`rounded-2xl font-black shadow-md flex items-center justify-center text-3xl transition-all cursor-pointer ${
                    isDone 
                      ? 'opacity-20 bg-stone-300 text-stone-500 scale-90' 
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white active:scale-95 border-2 border-emerald-800'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        )}

        {/* 5. Shapes (Biggest / Smallest) */}
        {(currentGame === 'biggest' || currentGame === 'smallest') && (
          <div className="relative w-full h-full">
            {shapes.map((s, i) => (
              <button 
                key={s.id}
                onClick={() => i === correctShapeIdx ? handleSuccess() : handleFail()}
                className="absolute bg-emerald-700 hover:bg-emerald-600 border-2 border-emerald-900 rounded-2xl shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-95 cursor-pointer flex items-center justify-center text-white font-bold"
                style={{ 
                  left: `${s.x}%`, 
                  top: `${s.y}%`,
                  width: `${s.size}px`, 
                  height: `${s.size}px`
                }}
              >
                📐
              </button>
            ))}
          </div>
        )}

        {/* 6. Color Match */}
        {currentGame === 'color_match' && (
          <div className="grid grid-cols-2 gap-3 h-full p-4">
            {colorOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => c.name === targetColor.name ? handleSuccess() : handleFail()}
                className={`${c.bg} rounded-2xl shadow-md text-white font-black text-sm flex items-center justify-center transition-transform active:scale-95 border-2 border-white/40 cursor-pointer`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* 7. Odd One Out */}
        {currentGame === 'odd_one_out' && (
          <div className="grid grid-cols-2 gap-3 h-full p-4">
            {oddOptions.map((item) => (
              <button
                key={item.id}
                onClick={() => item.isOdd ? handleSuccess() : handleFail()}
                className="bg-stone-100 hover:bg-amber-100 hover:border-amber-400 border-2 border-stone-200 text-4xl font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                {item.icon}
              </button>
            ))}
          </div>
        )}

        {/* 8. Boundary Side */}
        {currentGame === 'boundary_side' && (
          <div className="flex h-full w-full">
            <button
              onClick={() => boundaryTargetSide === 'LEFT' ? handleSuccess() : handleFail()}
              className="flex-1 bg-stone-50 hover:bg-emerald-100 border-r-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 active:bg-emerald-200 transition-colors"
            >
              <span className="text-3xl">👈</span>
              <span className="font-black text-xs text-stone-600">左領域</span>
            </button>
            <button
              onClick={() => boundaryTargetSide === 'RIGHT' ? handleSuccess() : handleFail()}
              className="flex-1 bg-stone-50 hover:bg-emerald-100 flex flex-col items-center justify-center gap-2 active:bg-emerald-200 transition-colors"
            >
              <span className="text-3xl">👉</span>
              <span className="font-black text-xs text-stone-600">右領域</span>
            </button>
          </div>
        )}

        {/* 9. Not Condition */}
        {currentGame === 'not_condition' && (
          <div className="grid grid-cols-2 gap-3 h-full p-4">
            {notCondition.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => opt.id === notCondition.correctId ? handleSuccess() : handleFail()}
                className="bg-stone-100 hover:bg-emerald-100 border-2 border-stone-200 hover:border-emerald-400 text-stone-800 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-3xl">{opt.icon}</span>
                <span className="text-xs font-black">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   2. 構造・仕分け（Ti）：「概念圧縮整理」
------------------------------------------------------------- */
const TI_WORDS: { word: string; category: 'LOGIC' | 'EMOTION' }[] = [
  { word: '因果関係', category: 'LOGIC' },
  { word: '相関関係', category: 'LOGIC' },
  { word: '環境要因', category: 'LOGIC' },
  { word: '前提条件', category: 'LOGIC' },
  { word: '統計的有意差', category: 'LOGIC' },
  { word: '定量的データ', category: 'LOGIC' },
  { word: '構造的一貫性', category: 'LOGIC' },
  { word: '客観的妥当性', category: 'LOGIC' },
  { word: '境界線規約', category: 'LOGIC' },
  { word: '論理積（AND）', category: 'LOGIC' },
  
  { word: 'なんか嫌だ', category: 'EMOTION' },
  { word: '共感してほしい', category: 'EMOTION' },
  { word: 'センチメンタル', category: 'EMOTION' },
  { word: '直感とノリ', category: 'EMOTION' },
  { word: '傷ついた気持ち', category: 'EMOTION' },
  { word: '主観的不満', category: 'EMOTION' },
  { word: 'エモい雰囲気', category: 'EMOTION' },
  { word: 'なんとなく不安', category: 'EMOTION' },
  { word: '理屈じゃない', category: 'EMOTION' },
  { word: '空気読んで', category: 'EMOTION' },
];

function SortingGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [wordIndex, setWordIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [shuffledList] = useState<{ word: string; category: 'LOGIC' | 'EMOTION' }[]>(() => 
    [...TI_WORDS].sort(() => Math.random() - 0.5)
  );
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

  const currentItem = shuffledList[wordIndex % (shuffledList.length || 1)] || TI_WORDS[0];

  const handleSort = (selectedCategory: 'LOGIC' | 'EMOTION') => {
    if (isGameOver) return;
    if (selectedCategory === currentItem.category) {
      setScore(s => s + 1 + Math.floor(combo / 3));
      setCombo(c => c + 1);
      setFeedback('CORRECT');
    } else {
      setCombo(0);
      setFeedback('WRONG');
    }
    setTimeout(() => setFeedback(null), 250);
    setWordIndex(i => i + 1);
  };

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) {
      onFinish(score);
    }
  }, [isGameOver, score, onFinish]);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-stone-400">SCORE</span>
          <span className="text-xl font-black text-emerald-700">{score}</span>
          {combo > 2 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
              🔥 {combo} COMBO!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-stone-400">残り時間</span>
          <span className={`text-base font-black font-mono px-2.5 py-0.5 rounded ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-stone-100 text-stone-800'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-900 px-3 py-2 rounded-xl text-center font-bold text-xs">
        💡 降ってくる概念を【論理・構造 (Ti)】と【感情・主観 (Fe)】へ高速仕分けせよ！
      </div>

      <div className="relative w-full h-[270px] bg-stone-900 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4">
        {/* Falling Word Card */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={wordIndex}
            initial={{ scale: 0.5, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className={`bg-white border-3 rounded-2xl px-6 py-4 shadow-2xl text-center flex flex-col items-center ${
              feedback === 'CORRECT' 
                ? 'border-emerald-500 bg-emerald-50' 
                : feedback === 'WRONG'
                ? 'border-red-500 bg-red-50'
                : 'border-stone-200'
            }`}
          >
            <span className="text-xs font-bold text-stone-400 mb-1">分類対象概念</span>
            <span className="text-xl sm:text-2xl font-black text-stone-800">{currentItem.word}</span>
          </motion.div>
        </div>

        {/* Sort Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSort('LOGIC')}
            className="bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black py-4 px-4 rounded-xl shadow-lg border-2 border-emerald-500 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <span className="text-2xl">📐 👈</span>
            <span className="text-sm">【論理・構造】(Ti)</span>
            <span className="text-[10px] text-emerald-200">原因・データ・規約</span>
          </button>

          <button
            onClick={() => handleSort('EMOTION')}
            className="bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-black py-4 px-4 rounded-xl shadow-lg border-2 border-rose-500 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <span className="text-2xl">👉 💬</span>
            <span className="text-sm">【感情・主観】(Fe)</span>
            <span className="text-[10px] text-rose-200">気分・共感・空気</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   3. 不器用Fe・対話ミニゲーム（Fe/極限）：「感情分解対応」
------------------------------------------------------------- */
interface FeScenario {
  id: number;
  userSituation: string;
  lsiStatement: string;
  choices: {
    text: string;
    score: number;
    feedback: string;
    lsiReaction: string;
  }[];
}

const ALL_FE_SCENARIOS: FeScenario[] = [
  {
    id: 1,
    userSituation: '友人：「大事なプレゼンで頭が真っ白になって大失敗した……もう穴があったら入りたい……」',
    lsiStatement: '「……それは失敗そのものより“再現性のない不安”が原因じゃない？ ミスの確率を分解するとさ、環境要因と内部要因があって――だから感情的に落ち込むのは統計的には自然で……」',
    choices: [
      {
        text: '「『……って言ってるけど、準備を誰より頑張ってたのは知ってるよ！次は環境側の要因を一緒に潰そう』と添える」',
        score: 10,
        feedback: '大成功！ LSIの構造分解と感情的配慮が見事に調和し、友人も前を向けました。',
        lsiReaction: '「モゾ……貴殿のFe補正により、場が氷点下になるのを防いだ。感謝する」'
      },
      {
        text: '「『落ち込んでも生産性ゼロだから即座にPDCA回そう！』と理詰めに加勢する」',
        score: 2,
        feedback: '盛大に場が凍結！ 友人はさらに心を閉ざしてしまいました……',
        lsiReaction: '「……（室温が急激に低下。Fe回路がショート寸前）」'
      },
      {
        text: '「『とりあえず美味しいもの食べて全部忘れよ！』と論理を全破棄する」',
        score: 5,
        feedback: '場は和みましたが、LSI芋虫は「原因の構造化を放棄しては再発する……」と納得していません。',
        lsiReaction: '「ぬぬ……しかし原因の再現性を絶たねば根本解決にならんのでは……？」'
      }
    ]
  },
  {
    id: 2,
    userSituation: '同僚：「毎日残業続きで心身ともにボロボロ……誰にも認められない……」',
    lsiStatement: '「……評価基準の可視化不足だな。承認欲求の未充足を業務プロセスに帰定させるのは論理的に誤謬だ。タスクの優先度マトリクスを再定義したまえ」',
    choices: [
      {
        text: '「『正論だけど、今はまず身体を休めて！ いつも支えてくれて本当に助かってるよ』と体調と感謝を伝える」',
        score: 10,
        feedback: '完璧なFe対応！ 同僚は涙ぐみ、LSI芋虫も「休息の優先順位第1位」を納得しました。',
        lsiReaction: '「モゾ……【生存維持プロトコル】体力の回復が全タスクの前提条件か。論理的に妥当だ」'
      },
      {
        text: '「『残業時間をグラフにして上司にエビデンスを突きつけろ！』と煽る」',
        score: 4,
        feedback: '攻撃的すぎて同僚の不安が増大してしまいました。',
        lsiReaction: '「Se（外向感覚）の圧力が過剰だ。交渉決裂のリスクが高い」'
      },
      {
        text: '「『よし、明日全員で会社サボろうぜ！』とおどける」',
        score: 3,
        feedback: '冗談と受け取れず規律違反を警告されました。',
        lsiReaction: '「就業規則違反だ。懲戒対象になるぞ」'
      }
    ]
  },
  {
    id: 3,
    userSituation: '後輩：「一生懸命作った資料を全否定されて、自分には才能がない気がします……」',
    lsiStatement: '「……成果物の品質と個人の存在価値を同一視するな。赤入れされた箇所をカテゴリ分類（形式・内容・事実誤認）して修正工数を算出せよ」',
    choices: [
      {
        text: '「『言いたいことは“君自身を否定したわけじゃない”ってことだよ。基礎はできてるから一緒に直そう！』と通訳する」',
        score: 10,
        feedback: '素晴らしい通訳！ 後輩は前向きに修正に取り掛かることができました。',
        lsiReaction: '「……なるほど、意図をそのように変換して伝達するのか。Fe言語の高度な翻訳だな」'
      },
      {
        text: '「『才能の有無を議論する前にまずタイピング速度を測れ』とさらに冷たく言う」',
        score: 1,
        feedback: '後輩が泣き出してしまいました……',
        lsiReaction: '「……（涙の成分を分析中……塩分濃度が上昇……）」'
      },
      {
        text: '「『否定した上司の愚痴を朝まで飲み明かして言い合おう！』と感情発散に付き合う」',
        score: 5,
        feedback: '一時的にはスッキリしましたが、資料の修正は進みませんでした。',
        lsiReaction: '「明日の締切に対するリスク管理が疎かになっている……」'
      }
    ]
  },
  {
    id: 4,
    userSituation: '友人：「恋人と連絡頻度のことで大喧嘩して、もう別れるしかないのかなって……（号泣）」',
    lsiStatement: '「……連絡回数の最適値についての合意形成（SLA）を結んでいないのが根本原因だ。1日あたりの平均文字数と返信遅延時間を規約化すれば解決する」',
    choices: [
      {
        text: '「『まずは泣いてスッキリしな。寂しかった気持ちを認めてから、お互いの心地いいペースを話そう』と寄り添う」',
        score: 10,
        feedback: '大正解！ 友人は安心し、LSI芋虫も「感情の安定化が交渉の前提」と学びました。',
        lsiReaction: '「モゾ……交渉前の心理的安全性の確保か。合理的なステップだ」'
      },
      {
        text: '「『契約書（合意書）に署名捺印させれば二度と喧嘩しないぞ！』と同意する」',
        score: 2,
        feedback: '「余計に別れるわ！」と友人に怒鳴られてしまいました。',
        lsiReaction: '「ぬぬ……契約の法的拘束力に拒絶反応が出た……？」'
      },
      {
        text: '「『そんなやつ今すぐブロックして新しい人探そ！』と切り捨てる」',
        score: 4,
        feedback: '友人はまだ好きなのに極論を言われて困惑しています。',
        lsiReaction: '「性急な破棄は sunk cost（埋没費用）の損失が大きい」'
      }
    ]
  },
  {
    id: 5,
    userSituation: '創作仲間：「数ヶ月かけて描いたイラスト、SNSで全然いいねがつかなくて……もう描く意味ないかも……」',
    lsiStatement: '「……アルゴリズムの表示回数インプレッションと投稿時間帯の相関を分析せよ。評価値はアルゴリズム依存であり作品の本質価値とは無関係だ」',
    choices: [
      {
        text: '「『この構図と色のこだわり、すごく好きだよ！ 届く人には絶対響くから描き続けよう』と熱量を肯定する」',
        score: 10,
        feedback: '完璧！ 創作者の情熱が再燃し、LSI芋虫も「内発的動機の重要性」を理解しました。',
        lsiReaction: '「……内発的モチベーションの維持係数が向上した。Feの効用を認める」'
      },
      {
        text: '「『数字が全てだから、流行りのトレンドタグを100個コピペして再投稿しろ』と命令する」',
        score: 3,
        feedback: '仲間は「そういうことじゃない……」と筆を折ってしまいました。',
        lsiReaction: '「SEO最適化の提案だったのだが……拒否された」'
      },
      {
        text: '「『ネットなんて見るな！ 自分の部屋にだけ飾っとけ！』と遮断する」',
        score: 4,
        feedback: '極端すぎて仲間は苦笑いしています。',
        lsiReaction: '「閉鎖環境での自己充足……検証可能性がゼロになるな」'
      }
    ]
  },
  {
    id: 6,
    userSituation: '同僚：「ダイエット中なのに深夜に背徳の豚骨ラーメンとチャーハン食べてしまった……自己嫌悪で死にそう……」',
    lsiStatement: '「……摂取カロリー約1,450kcalの過剰超過。明日の基礎代謝と運動量による相殺計画を立案し、脂質代謝プロセッサを稼働させよ。悩む時間のカロリー消費は0.5kcalだ」',
    choices: [
      {
        text: '「『たまには息抜きも必要！美味しかったならOK！明日からまた無理せず調整しよ！』と笑顔で許容する」',
        score: 10,
        feedback: '絶妙なFeフォロー！ 同僚の自己嫌悪が解け、明日からのやる気が湧きました。',
        lsiReaction: '「モゾ……罪悪感によるストレスコルチゾールの分泌を抑制したか。賢明だ」'
      },
      {
        text: '「『今すぐスクワット1000回やって食べた分をチャラにしろ！』とスパルタ化」',
        score: 2,
        feedback: '同僚は胃もたれと筋肉痛で倒れそうになりました。',
        lsiReaction: '「急激なSe負荷は心肺機能に過負荷を与える」'
      },
      {
        text: '「『もう諦めて毎日ラーメン食べ歩こうぜ！』と道連れにする」',
        score: 3,
        feedback: '健康診断で要再検査になってしまいます。',
        lsiReaction: '「健康維持規律の完全破綻だ。却下する」'
      }
    ]
  },
  {
    id: 7,
    userSituation: '家族：「明日引越しなのに荷造りが3割しか終わってない！ どうしよう何から手をつければいいの！？（パニック）」',
    lsiStatement: '「……パニックは認知リソースを浪費する。部屋をグリッド分割し、廃棄率の高いエリアから順次ダンボールに封入せよ。感傷的なアルバムを開くな」',
    choices: [
      {
        text: '「『大丈夫、絶対間に合うから！私が一番重いキッチン周りやるから、服の仕分けお願いできる？』と落ち着かせる」',
        score: 10,
        feedback: '完璧なリーダーシップ！ 家族はパニックから脱出し、見事に荷造りが完了しました。',
        lsiReaction: '「タスク並列処理と安心感の同時付与……見事な指揮統制だ」'
      },
      {
        text: '「『引越し業者に電話して日程延期ペナルティ金を払え』と即決する」',
        score: 3,
        feedback: '余計な出費とトラブルが発生してしまいました。',
        lsiReaction: '「損失回避の観点から下策であったか……」'
      },
      {
        text: '「『とりあえず思い出のアルバム見てお茶でも飲もう〜』と現実逃避する」',
        score: 1,
        feedback: '翌朝引越し業者が来て修羅場になりました！',
        lsiReaction: '「警告したはずだ……アルバムのトラップに嵌まったな」'
      }
    ]
  },
  {
    id: 8,
    userSituation: '友人：「半年間ずっと楽しみに生きてきた推しのドームツアーチケット、全滅した……明日から何のために生きればいいの……」',
    lsiStatement: '「……倍率32.4倍の抽選における落選確率は96.9%だ。統計的必然であり貴殿の徳の低さではない。リセール市場の出品規約を監視せよ」',
    choices: [
      {
        text: '「『つらすぎるよね……！今日はいっぱい泣いて推しの円盤一緒に観よ！リセールも絶対諦めずに張ろう！』と共鳴する」',
        score: 10,
        feedback: '最高の共感とバックアップ！ 友人は希望を取り戻しました。',
        lsiReaction: '「……共感の波動により精神崩壊を回避。Feの救済力を認める」'
      },
      {
        text: '「『他のアイドルに乗り換えた方が確率論的にコスパが良い』と勧める」',
        score: 2,
        feedback: '「推しは代わりがいないの！！」と大激怒されました。',
        lsiReaction: '「推しの固有性（ユニークID）を甘く見ていた……」'
      },
      {
        text: '「『当たらなくてお金浮いたじゃん、貯金しなよ』と正論をぶつける」',
        score: 1,
        feedback: '友人の瞳から光が完全に消え去りました……',
        lsiReaction: '「……（Feメーターがマイナス無限大に突入）」'
      }
    ]
  }
];

function FeDialogueGame({ onFinish }: { onFinish: (score: number) => void }) {
  // Randomly pick 3 questions from stock and shuffle choices for each question
  const [selectedScenarios] = useState<FeScenario[]>(() => {
    const shuffled = [...ALL_FE_SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 3);
    return shuffled.map(s => ({
      ...s,
      choices: [...s.choices].sort(() => Math.random() - 0.5)
    }));
  });

  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scenario = selectedScenarios[currentScenarioIdx] || selectedScenarios[0];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedChoice(idx);
    setShowResult(true);
    const earned = scenario.choices[idx].score;
    setTotalScore(s => s + earned);
  };

  const handleNext = () => {
    if (currentScenarioIdx < selectedScenarios.length - 1) {
      setCurrentScenarioIdx(i => i + 1);
      setSelectedChoice(null);
      setShowResult(false);
    } else {
      onFinish(totalScore);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-stone-200 shadow-xs">
        <span className="text-xs font-black text-stone-500">
          相談シナリオ: {currentScenarioIdx + 1} / {selectedScenarios.length} (ランダム3問選出)
        </span>
        <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
          Fe調和スコア: {totalScore} pt
        </span>
      </div>

      {/* Dialogue Stage */}
      <div className="bg-stone-50 border-2 border-stone-300 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
        
        {/* User Situation */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs sm:text-sm font-bold text-amber-900 leading-relaxed shadow-xs">
          {scenario.userSituation}
        </div>

        {/* LSI Caterpillar Rigid Statement */}
        <div className="bg-white border-2 border-emerald-600/50 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">🐛</span>
            <span className="text-xs font-black text-emerald-800">LSI芋虫（極度の理詰め発言）:</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
            {scenario.lsiStatement}
          </p>
        </div>

        {/* Choices (Shuffled) */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-black text-stone-600 flex items-center gap-1.5">
            <MessageSquareHeart className="w-4 h-4 text-rose-600" />
            <span>【プレイヤーのFeフォロー選択】場を暖める最適なフォローを選べ：</span>
          </span>

          {scenario.choices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showResult}
              className={`p-3 rounded-xl border-2 text-left text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedChoice === idx
                  ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-md'
                  : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800 shadow-xs'
              } ${showResult && selectedChoice !== idx ? 'opacity-40' : ''}`}
            >
              {choice.text}
            </button>
          ))}
        </div>

        {/* Result Feedback Dialog */}
        {showResult && selectedChoice !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 text-white rounded-xl p-4 flex flex-col gap-2.5 shadow-xl border border-stone-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-300">
                獲得Fe調和度: +{scenario.choices[selectedChoice].score} pt
              </span>
              <span className="text-xs text-stone-400">監査完了</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-300 font-medium leading-relaxed">
              {scenario.choices[selectedChoice].feedback}
            </p>
            <div className="bg-stone-800/80 p-2.5 rounded-lg text-xs font-mono text-stone-200">
              {scenario.choices[selectedChoice].lsiReaction}
            </div>

            <button
              onClick={handleNext}
              className="mt-2 w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{currentScenarioIdx < selectedScenarios.length - 1 ? '次の相談へ' : '結果を見る'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   4. 物理連打バフ（Se/1F）：「芋虫もぐら叩き」
------------------------------------------------------------- */
interface HoleState {
  id: number;
  type: 'caterpillar' | 'darling' | 'none';
  scream?: string;
  isHit?: boolean;
}

const CATERPILLAR_SCREAMS = [
  '境界線確保失敗！！',
  '感覚支配が……！？',
  'Seの暴力やめろーっ！',
  'ぐしゃあっ！ 論理崩壊！',
  '不可侵領土が突破された！',
  '1F物理への直接打撃は違法だぞ！'
];

function WhackACaterpillarGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isGameOver, setIsGameOver] = useState(false);
  const [splats, setSplats] = useState<{ id: number; holeIndex: number; text: string; isDarling?: boolean }[]>([]);
  const [holes, setHoles] = useState<HoleState[]>([
    { id: 0, type: 'none' },
    { id: 1, type: 'none' },
    { id: 2, type: 'none' },
    { id: 3, type: 'none' },
    { id: 4, type: 'none' },
    { id: 5, type: 'none' },
    { id: 6, type: 'none' },
    { id: 7, type: 'none' },
    { id: 8, type: 'none' }
  ]);

  // Spawn loop
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setHoles(prev => {
        const next = prev.map(h => ({ ...h, isHit: false }));
        // pick 1 to 3 random holes to popup
        const count = Math.floor(Math.random() * 2) + 1;
        const availableIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5).slice(0, count);

        // 80% caterpillar, 20% Darling-chan (trap)
        availableIndices.forEach(idx => {
          const isDarling = Math.random() < 0.22;
          next[idx] = {
            id: idx,
            type: isDarling ? 'darling' : 'caterpillar',
            scream: CATERPILLAR_SCREAMS[Math.floor(Math.random() * CATERPILLAR_SCREAMS.length)],
            isHit: false
          };
        });

        // clear other holes
        next.forEach((h, i) => {
          if (!availableIndices.includes(i)) {
            next[i] = { id: i, type: 'none', isHit: false };
          }
        });

        return next;
      });
    }, 950);

    return () => clearInterval(interval);
  }, [isGameOver]);

  // Timer loop
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  // Finish safely
  useEffect(() => {
    if (isGameOver) {
      onFinish(Math.max(0, score));
    }
  }, [isGameOver, score, onFinish]);

  const handleWhack = (idx: number, e: React.MouseEvent) => {
    if (isGameOver) return;
    const target = holes[idx];
    if (target.type === 'none' || target.isHit) return;

    if (target.type === 'caterpillar') {
      // Hit Caterpillar!
      setScore(s => s + 1);
      const scream = target.scream || 'ぐしゃあっ！';
      
      setSplats(s => [...s, { id: Date.now() + Math.random(), holeIndex: idx, text: scream, isDarling: false }]);
      
      // Mark hole as hit
      setHoles(prev => prev.map((h, i) => i === idx ? { ...h, isHit: true, type: 'none' } : h));
    } else if (target.type === 'darling') {
      // Trap! Darling-chan hit
      setScore(s => Math.max(0, s - 5));
      setSplats(s => [...s, { id: Date.now() + Math.random(), holeIndex: idx, text: '「ダーリン♡ なにするん……（大激怒）」', isDarling: true }]);
      setHoles(prev => prev.map((h, i) => i === idx ? { ...h, isHit: true, type: 'none' } : h));
    }

    setTimeout(() => {
      setSplats(s => s.slice(1));
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Status Bar */}
      <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-stone-400">連打スコア</span>
          <span className="text-xl font-black text-emerald-700">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-stone-400">残り時間</span>
          <span className={`text-base font-black font-mono px-2.5 py-0.5 rounded ${timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-stone-100 text-stone-800'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Mission Banner */}
      <div className="bg-amber-50 border border-amber-300 text-amber-900 px-3 py-2 rounded-xl text-center font-black text-xs shadow-xs">
        🔨 穴から出た【LSI芋虫 🐛】を連打で叩け！ 【ダーリンちゃん 🥺】を叩くと大減点トラップ！
      </div>

      {/* 3x3 Whack Grid */}
      <div className="relative w-full h-[320px] bg-stone-800 border-3 border-stone-700 rounded-2xl p-4 grid grid-cols-3 gap-3 shadow-inner select-none overflow-hidden">
        
        {holes.map((hole, idx) => {
          const currentSplats = splats.filter(s => s.holeIndex === idx);
          return (
            <div
              key={hole.id}
              onClick={(e) => handleWhack(idx, e)}
              className="relative bg-stone-900 border-2 border-stone-700 rounded-2xl flex items-center justify-center cursor-pointer overflow-visible shadow-inner active:bg-stone-950 transition-colors"
            >
              {/* Hole Ground Pattern */}
              <div className="absolute inset-x-2 bottom-1 h-3 bg-stone-950/80 rounded-full blur-xs pointer-events-none" />

              {/* Target Actor */}
              <AnimatePresence>
                {hole.type === 'caterpillar' && (
                  <motion.div
                    initial={{ y: 50, scale: 0.5, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 50, scale: 0.5, opacity: 0 }}
                    className="text-5xl sm:text-6xl drop-shadow-md select-none transform hover:scale-110 active:scale-95 transition-transform"
                  >
                    🐛
                  </motion.div>
                )}

                {hole.type === 'darling' && (
                  <motion.div
                    initial={{ y: 50, scale: 0.5, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 50, scale: 0.5, opacity: 0 }}
                    className="relative flex flex-col items-center select-none"
                  >
                    <span className="text-5xl sm:text-6xl drop-shadow-md animate-bounce">🥺</span>
                    <span className="text-[9px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded-full absolute -bottom-1 whitespace-nowrap shadow-xs">
                      罠！
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Speech bubble precisely at this hole */}
              {currentSplats.map(s => (
                <motion.div
                  key={s.id}
                  initial={{ scale: 0.4, opacity: 1, y: 10 }}
                  animate={{ scale: 1.05, opacity: 0, y: -45 }}
                  transition={{ duration: 1.1 }}
                  className={`absolute pointer-events-none z-50 px-2.5 py-1 rounded-xl font-black text-xs shadow-2xl border-2 whitespace-nowrap -top-3 left-1/2 -translate-x-1/2 ${
                    s.isDarling 
                      ? 'bg-rose-900 text-rose-100 border-rose-400' 
                      : 'bg-emerald-800 text-emerald-100 border-emerald-400'
                  }`}
                >
                  {s.text}
                  {!s.isDarling && (
                    <span className="ml-1 text-amber-300">✨ Ti散乱！</span>
                  )}
                </motion.div>
              ))}
            </div>
          );
        })}

      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   Main MiniGames Hub Component
------------------------------------------------------------- */
export default function MiniGames({ 
  onComplete,
  onReward,
  caterpillarStage
}: { 
  onComplete?: (score: number, points: number) => void;
  onReward?: (pointsGained: number, expGained: number, gameName: string) => void;
  caterpillarStage?: string;
}) {
  const [selectedGameMode, setSelectedGameMode] = useState<'hub' | 'reflex' | 'sorting' | 'fe_dialogue' | 'whack'>('hub');
  const [lastGameResult, setLastGameResult] = useState<{ mode: string; score: number; exp: number; points: number } | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Balanced Rewards: Lots of Points (Coins), Small amount of EXP so caterpillar doesn't level up too quickly!
  const handleGameFinish = (mode: string, score: number, ptMultiplier = 15, expMultiplier = 1) => {
    const expGain = Math.max(1, Math.round(score * expMultiplier));
    const ptGain = Math.max(5, score * ptMultiplier);
    setLastGameResult({ mode, score, exp: expGain, points: ptGain });
    setSelectedGameMode('hub');
    if (onReward) {
      onReward(ptGain, expGain, mode);
    }
    if (onComplete) {
      onComplete(score, ptGain);
    }
  };

  const handleShare = async () => {
    if (!lastGameResult) return;
    const text = `🐛【LSI芋虫 規律訓練シミュレーター】\n『${lastGameResult.mode}』で【スコア ${lastGameResult.score} 点】を達成！\n獲得コイン: +${lastGameResult.points}TP 獲得！\n\n#LSI芋虫 #ソシオニクス #規律訓練`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'LSI芋虫 訓練スコア', text, url });
        return;
      } catch (e) {}
    }

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank');
  };

  const handleCopyShare = async () => {
    if (!lastGameResult) return;
    const text = `🐛【LSI芋虫 規律訓練シミュレーター】『${lastGameResult.mode}』で【スコア ${lastGameResult.score} 点】を達成！ +${lastGameResult.points}TP獲得！`;
    await navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 min-h-[440px]">
      
      {/* 1. Hub Menu */}
      {selectedGameMode === 'hub' && (
        <div className="max-w-2xl w-full flex flex-col gap-4">
          
          <div className="text-center bg-stone-50 border-2 border-stone-200 p-5 rounded-2xl shadow-xs">
            <h2 className="text-lg sm:text-xl font-black text-stone-800 flex items-center justify-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-700" />
              <span>🧠 LSI規律訓練・コイン稼ぎミニゲーム（全4種）</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
              ミニゲームでハイスコアを出して大量のコイン（TP）を稼ぎましょう！
            </p>
          </div>

          {/* Last Result Box if available */}
          {lastGameResult && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">前回スコア</span>
                <p className="text-sm font-black text-stone-800 mt-1">
                  『{lastGameResult.mode}』: <strong>{lastGameResult.score} 点</strong>（+{lastGameResult.exp} EXP, +{lastGameResult.points} TP）
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-none bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>X共有</span>
                </button>
                <button
                  onClick={handleCopyShare}
                  className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs px-3 py-2 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedShare ? '済' : 'コピー'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 4 Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* 1. Reflex */}
            <div className="bg-white border-2 border-stone-200 hover:border-emerald-500 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all group">
              <div>
                <div className="w-10 h-10 bg-red-100 text-red-700 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <h3 className="font-black text-sm text-stone-800">1. 物理・反射（Se）</h3>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">「規律即時履行」</p>
                <p className="text-[11px] text-stone-500 font-medium mt-2 leading-relaxed">
                  不正アクセス遮断、ランダム数列の昇降順監査、奇数抽出、境界線判定など瞬発反射テスト！
                </p>
              </div>
              <button
                onClick={() => setSelectedGameMode('reflex')}
                className="mt-4 w-full bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>訓練開始</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Sorting */}
            <div className="bg-white border-2 border-stone-200 hover:border-blue-500 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all group">
              <div>
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                  📐
                </div>
                <h3 className="font-black text-sm text-stone-800">2. 構造・仕分け（Ti）</h3>
                <p className="text-xs font-bold text-blue-700 mt-0.5">「概念圧縮整理」</p>
                <p className="text-[11px] text-stone-500 font-medium mt-2 leading-relaxed">
                  上から降ってくる言葉を【論理・構造】と【感情・主観】コンテナへ超スピード仕分け！
                </p>
              </div>
              <button
                onClick={() => setSelectedGameMode('sorting')}
                className="mt-4 w-full bg-blue-700 hover:bg-blue-600 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>訓練開始</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Fe Dialogue */}
            <div className="bg-white border-2 border-stone-200 hover:border-rose-500 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all group">
              <div>
                <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                  💬
                </div>
                <h3 className="font-black text-sm text-stone-800">3. 不器用Fe（Fe/極限）</h3>
                <p className="text-xs font-bold text-rose-700 mt-0.5">「感情分解対応（ランダム3問）」</p>
                <p className="text-[11px] text-stone-500 font-medium mt-2 leading-relaxed">
                  ストックからランダム3問出題＆選択肢シャッフル！ LSI芋虫の極度な理詰め暴走を温かいFeフォローで救出！
                </p>
              </div>
              <button
                onClick={() => setSelectedGameMode('fe_dialogue')}
                className="mt-4 w-full bg-rose-700 hover:bg-rose-600 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>訓練開始</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Whack-a-Caterpillar */}
            <div className="bg-white border-2 border-stone-200 hover:border-amber-500 rounded-2xl p-4 flex flex-col justify-between shadow-xs transition-all group">
              <div>
                <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform">
                  🔨
                </div>
                <h3 className="font-black text-sm text-stone-800">4. 物理連打バフ（Se/1F）</h3>
                <p className="text-xs font-bold text-amber-700 mt-0.5">「芋虫もぐら叩き」</p>
                <p className="text-[11px] text-stone-500 font-medium mt-2 leading-relaxed">
                  穴から顔を出す芋虫をタップ連打！ 断末魔とTiデータがブシャーッと弾け飛ぶ！ ダーリンちゃんのブチギレ罠に注意！
                </p>
              </div>
              <button
                onClick={() => setSelectedGameMode('whack')}
                className="mt-4 w-full bg-amber-600 hover:bg-amber-500 text-white font-black text-xs py-2.5 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>訓練開始</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 2. Reflex Game */}
      {selectedGameMode === 'reflex' && (
        <div className="w-full max-w-lg flex flex-col gap-2">
          <button
            onClick={() => setSelectedGameMode('hub')}
            className="self-start text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>メニューに戻る</span>
          </button>
          <ReflexGame onFinish={(score) => handleGameFinish('物理・反射（Se）', score, 15, 1)} />
        </div>
      )}

      {/* 3. Sorting Game */}
      {selectedGameMode === 'sorting' && (
        <div className="w-full max-w-lg flex flex-col gap-2">
          <button
            onClick={() => setSelectedGameMode('hub')}
            className="self-start text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>メニューに戻る</span>
          </button>
          <SortingGame onFinish={(score) => handleGameFinish('構造・仕分け（Ti）', score, 12, 1)} />
        </div>
      )}

      {/* 4. Fe Dialogue Game */}
      {selectedGameMode === 'fe_dialogue' && (
        <div className="w-full max-w-lg flex flex-col gap-2">
          <button
            onClick={() => setSelectedGameMode('hub')}
            className="self-start text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>メニューに戻る</span>
          </button>
          <FeDialogueGame onFinish={(score) => handleGameFinish('不器用Fe（感情分解対応）', score, 20, 2)} />
        </div>
      )}

      {/* 5. Whack-a-caterpillar Game */}
      {selectedGameMode === 'whack' && (
        <div className="w-full max-w-lg flex flex-col gap-2">
          <button
            onClick={() => setSelectedGameMode('hub')}
            className="self-start text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 mb-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>メニューに戻る</span>
          </button>
          <WhackACaterpillarGame onFinish={(score) => handleGameFinish('芋虫もぐら叩き（Se連打）', score, 10, 1)} />
        </div>
      )}

    </div>
  );
}
