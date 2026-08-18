import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to restore the clerk and defensive items.
# Let's locate the broken part:
broken_part = """                <img 
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">"""

restored_part = """                <img 
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
                {/* 防虫スプレー */}
                <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-2xl">
                      <Wind className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-stone-900">防虫・規律スプレー</h4>
                      <p className="text-[10px] text-stone-500 font-medium">不審な羽虫を撃退 (現在: {data.sprayCount || 0}回分)</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBuySpray}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs transition active:scale-95 shrink-0"
                  >
                    80 TP
                  </button>
                </div>

                {/* 芋虫保育園 */}
                <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl">
                      <Home className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-stone-900">芋虫保育園 1日券</h4>
                      <p className="text-[10px] text-stone-500 font-medium">24時間安全保護 (不在時のペナルティ免除)</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBuyDaycare}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs transition active:scale-95 shrink-0"
                  >
                    150 TP
                  </button>
                </div>
              </div>
            </div>
            
            {/* -------------------------------------------------------------
                SHOP EXCLUSIVE PREMIUM FOOD
            ------------------------------------------------------------- */}
            <h4 className="mt-4 font-black text-stone-900 text-sm border-b-2 border-stone-200 pb-1 mb-2">プレミアムエサ（即時投与）</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Premium Ti/Se */}
              <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl">🧊</div>
                  <div>
                    <h4 className="font-black text-sm text-stone-900">超純水LSIプロテイン</h4>
                    <p className="text-[10px] text-stone-500 font-medium">Ti/Se属性値を大幅アップ<br/>(EXP +1000)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyPremiumFood(200, 1000, '超純水LSIプロテイン', 'cabbage')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs transition active:scale-95 shrink-0"
                >
                  200 TP
                </button>
              </div>

              {/* Premium Ne/Fe */}
              <div className="bg-white border-2 border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-2xl">🍯</div>
                  <div>
                    <h4 className="font-black text-sm text-stone-900">黄金律ロイヤルゼリー</h4>
                    <p className="text-[10px] text-stone-500 font-medium">Ne/Fe属性値を大幅アップ<br/>(EXP +1000)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleBuyPremiumFood(200, 1000, '黄金律ロイヤルゼリー', 'sugar')}
                  className="bg-yellow-500 hover:bg-yellow-400 text-white font-black text-xs px-3 py-2 rounded-xl shadow-xs transition active:scale-95 shrink-0"
                >
                  200 TP
                </button>
              </div>
            </div>

            {/* Furniture */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-700" />
                <span>ケージ内統制設備・家具一覧（全8種）</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">"""

content = content.replace(broken_part, restored_part)
# Also fix `v className="grid grid-cols-1 sm:grid-cols-2 gap-3">` from the bad replacement
content = content.replace('v className="grid grid-cols-1 sm:grid-cols-2 gap-3">', '</div>')
with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

