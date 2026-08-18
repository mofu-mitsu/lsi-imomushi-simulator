import re

with open("components/CaterpillarRoom.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "// Movement loop"
end_marker = "  // Drop food on click"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

old_loop = content[start_idx:end_idx]

new_loop = """// Movement loop
  useEffect(() => {
    if (isSquashed || isSleepingNow || isDarlingIncident) return;
    const interval = setInterval(() => {
      setCatPos(prev => {
        let target = catTarget;
        
        // Go towards Tonkotsu soup if placed!
        if (intruder && intruder.type === 'gohoubi' && intruder.soupPlaced) {
           target = { x: intruder.x, y: intruder.y };
        } else if (foods.length > 0) {
          target = foods[0].pos;
        }

        if (!target) return prev;

        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dx) > 1.2) {
          setTimeout(() => setFacingRight(dx > 0), 0);
        }

        // Active Play collision with ball toy
        if (ownedFurniture.includes('ball')) {
          const distToBall = Math.sqrt(Math.pow(prev.x - ballPos.x, 2) + Math.pow(prev.y - ballPos.y, 2));
          if (distToBall < 6) {
            const speed = 3.5 + Math.random() * 2.5;
            const dirX = dx !== 0 ? (dx / Math.abs(dx)) : (Math.random() > 0.5 ? 1 : -1);
            const dirY = dy !== 0 ? (dy / Math.abs(dy)) : (Math.random() > 0.5 ? 1 : -1);
            
            setTimeout(() => {
              setBallVelocity({ vx: dirX * speed, vy: dirY * speed });
              
              const ballComments = [
                '（コツン…！）運動量保存の法則に基づきボールを加速させた。',
                '（ポーン！）物理トイへの接触角45度。完全弾性衝突を観測。',
                'ボールの速度ベクトルを計算。ケージ内壁での反射角を予測中。',
                '自発的物理アクティビティ完了。骨格の敏捷性を確認。'
              ];
              setBubbleText(ballComments[Math.floor(Math.random() * ballComments.length)]);
              setTimeout(() => setBubbleText(null), 3500);
            }, 0);
          }
        }

        // Check collision with Gohoubi soup (Penalty if not chased away!)
        if (intruder && intruder.type === 'gohoubi' && intruder.soupPlaced) {
          const distToSoup = Math.sqrt(Math.pow(prev.x - intruder.x, 2) + Math.pow(prev.y - intruder.y, 2));
          if (distToSoup < 5) {
            setTimeout(() => {
              setBubbleText('モゾ…うぐっ…！ ご褒美の風呂上がり豚骨出汁を摂取してしまった……！ 油分過多で規律が崩壊（EXP低下）……！');
              if (onSquashLevelDown) {
                onSquashLevelDown(30, 'ご褒美の風呂上がり出汁摂取による規律崩壊');
              }
              setIntruder(null);
              setTimeout(() => setBubbleText(null), 4500);
            }, 0);
          }
        }

        if (dist < 3) {
          setTimeout(() => {
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

              onFeed(eaten.exp, eaten.name, eaten.type);
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
          }, 0);
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

"""

content = content.replace(old_loop, new_loop)
with open("components/CaterpillarRoom.tsx", "w", encoding="utf-8") as f:
    f.write(content)

