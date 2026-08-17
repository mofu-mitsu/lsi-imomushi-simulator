import re

with open('components/Dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add Premium Food Handler
handler_code = """
  const handleBuyPremiumFood = useCallback((cost: number, expGain: number, foodName: string, foodType: string) => {
    if (data.points < cost) {
      setClerkQuote(getClerkInsufficientFundsQuote(foodName, cost, data.points));
      return;
    }
    setClerkQuote(`「${foodName}のご購入を確認。物理空間へ直接転送します。成分の吸収プロセスを注視してください。」`);
    setData(prev => {
      const newPoints = prev.points - cost;
      const newExp = prev.exp + expGain;
      const timeStr = new Date().toLocaleTimeString();
      const logText = `ショップで「${foodName}」を購入・投与 (-${cost}pt, +${expGain}EXP)`;

      const currentStats = prev.foodStats || { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 };
      const newFoodStats = { ...currentStats };
      if (foodType === 'cabbage') newFoodStats.cabbage = (newFoodStats.cabbage || 0) + 10;
      else if (foodType === 'apple') newFoodStats.apple = (newFoodStats.apple || 0) + 10;
      else if (foodType === 'glucose') newFoodStats.glucose = (newFoodStats.glucose || 0) + 10;
      else if (foodType === 'sugar') newFoodStats.sugar = (newFoodStats.sugar || 0) + 10;
      else if (foodType === 'twig') newFoodStats.twig = (newFoodStats.twig || 0) + 10;
      
      let newStageData = getFormStageInfo(newExp, newFoodStats);
      if (newStageData.stageIdx <= (prev.stage || 0)) {
        newStageData = {
          stageInfo: ALL_ENCYCLOPEDIA_STAGES.find(s => s.name === prev.name) || newStageData.stageInfo,
          stageIdx: prev.stage || 0,
          formVariant: prev.formVariant || newStageData.formVariant
        };
      }
      const newDiscovered = Array.from(new Set([...(prev.discoveredStages || []), newStageData.stageInfo.name]));

      if (newStageData.stageIdx > (prev.stage || 0)) {
        setEvolutionNotice(newStageData.stageInfo);
        appendLogToGas(prev.gasWebAppUrl, 'EVOLUTION', `【形態進化】「${newStageData.stageInfo.name}」へ羽化・変態。規律パラメータ更新。`, 0, prev.uid);
      }

      const updated: CaterpillarData = {
        ...prev,
        points: newPoints,
        exp: newExp,
        name: newStageData.stageInfo.name,
        stage: newStageData.stageIdx,
        formVariant: newStageData.formVariant,
        foodStats: newFoodStats,
        discoveredStages: newDiscovered,
        lastFedAt: new Date().toISOString(),
        logs: [{ time: timeStr, text: logText }, ...prev.logs.slice(0, 19)]
      };
      
      appendLogToGas(prev.gasWebAppUrl, 'SHOP', logText, expGain, prev.uid);
      triggerGasSync(updated);
      return updated;
    });
  }, [data.points, triggerGasSync]);

  const handleBuyFurniture = useCallback
"""

content = content.replace("  const handleBuyFurniture = useCallback", handler_code.strip())

# 2. Add Premium Food to Shop UI
shop_ui_code = """
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
                
                <h4 className="mt-4 font-black text-stone-900 text-sm border-b-2 border-stone-200 pb-1 mb-2">設備・サポート</h4>
                {/* Item 1: Spray */}
"""

content = content.replace("{/* Item 1: Spray */}", shop_ui_code.strip())

with open('components/Dashboard.tsx', 'w') as f:
    f.write(content)
