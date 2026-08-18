import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "        {/* -------------------------------------------------------------\n            TAB 3: SHOP\n        ------------------------------------------------------------- */}"
end_marker = "        {/* -------------------------------------------------------------\n            TAB 4: MINI-GAMES / TRAINING\n        ------------------------------------------------------------- */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers.")
    exit(1)

clean_shop_tab = """        {/* -------------------------------------------------------------
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

            {/* -------------------------------------------------------------
                SHOP EXCLUSIVE PREMIUM FOOD
            ------------------------------------------------------------- */}
            <h4 className="font-black text-stone-900 text-sm border-b-2 border-stone-200 pb-1 mb-2">プレミアムエサ（即時投与）</h4>
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
            
            <h4 className="font-black text-stone-900 text-sm border-b-2 border-stone-200 pb-1 mb-2">設備・サポート</h4>
            <div className="grid grid-cols-1 gap-3">
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
                  150 TP
                </button>
              </div>

              {/* Item 3: Adoption */}
              <div className="bg-amber-50/60 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl">
                    🥚
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-stone-900">芋虫お見合い所（譲渡・リセット）</h4>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      現在の芋虫を図鑑（アーカイブ）に残し、新しい「卵（STAGE 0）」から育て直します。（※家具・ポイント・図鑑は引き継ぎ）<br/>
                      <strong className="text-amber-700">※STAGE 5（蝶）に羽化後のみ利用可能</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAdoptNewEgg}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                >
                  無料
                </button>
              </div>
            </div>

            {/* Furniture Grid */}
            <div className="flex flex-col gap-2.5 mt-2">
              <h3 className="text-xs font-black text-stone-700 flex items-center gap-1.5 border-b-2 border-stone-200 pb-1 mb-2">
                <Store className="w-4 h-4 text-emerald-700" />
                <span>ケージ内統制設備・家具一覧（全8種）</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {AVAILABLE_FURNITURE.map(item => {
                  const isOwned = data.furniture.includes(item.id);
                  const isEquipped = isOwned && (data.equippedFurniture || data.furniture).includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      className={`border-2 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all ${
                        isOwned 
                          ? 'bg-stone-50 border-stone-200' 
                          : 'bg-white border-stone-300 hover:border-emerald-500 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-3xl shrink-0 ${isOwned ? (isEquipped ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-200 border-stone-300 opacity-60') : 'bg-stone-100 border-stone-200'}`}>
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-stone-900">{item.name}</h4>
                          <p className="text-[11px] text-stone-500 font-medium mt-0.5 leading-tight">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col gap-2">
                        {isOwned ? (
                          <button
                            onClick={() => handleToggleFurniture(item)}
                            className={`text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center cursor-pointer ${
                              isEquipped 
                                ? 'bg-stone-200 hover:bg-stone-300 text-stone-700 border border-stone-300' 
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700'
                            }`}
                          >
                            {isEquipped ? '撤去する' : '設置する'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyFurniture(item)}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
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
\n"""

new_content = content[:start_idx] + clean_shop_tab + content[end_idx:]

with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

