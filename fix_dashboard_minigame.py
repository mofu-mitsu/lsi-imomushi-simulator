import re

with open('components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Fix handleMiniGameReward
handler_patch = """  const handleMiniGameReward = useCallback((tpReward: number, expReward: number) => {
    setData(prev => {
      const newExp = prev.exp + expReward;
      const newPoints = prev.points + tpReward;
      const timeStr = new Date().toLocaleTimeString();
      const logText = `ミニゲーム報酬を獲得 (+${tpReward} TP)`;

      let newStageData = getFormStageInfo(newExp, prev.foodStats);"""

content = re.sub(r'  const handleMiniGameReward = useCallback\(\(expReward: number, tpReward: number\) => \{\n    setData\(prev => \{\n      const newExp = prev\.exp \+ expReward;\n      const newPoints = prev\.points \+ tpReward;\n      const timeStr = new Date\(\)\.toLocaleTimeString\(\);\n      const logText = `ミニゲーム報酬を獲得 \(\+\$\{expReward\} EXP, \+\$\{tpReward\}pt\)`;\n\n      let newStageData = getFormStageInfo\(newExp, prev\.foodStats\);', handler_patch, content)

# Fix observationMode formVariant
obs_patch = """              <CaterpillarRoom 
                onFeed={handleFeed} 
                stage={data.stage} 
                formVariant={currentFormVariant}
                ownedFurniture={data.furniture}
                observationMode={true}"""

content = re.sub(r'              <CaterpillarRoom \n                onFeed=\{handleFeed\} \n                stage=\{data\.stage\} \n                ownedFurniture=\{data\.furniture\}\n                observationMode=\{true\}', obs_patch, content)

# Also fix the main CaterpillarRoom just in case it uses data.formVariant
main_room_patch = """              <CaterpillarRoom 
                onFeed={handleFeed} 
                stage={data.stage} 
                formVariant={currentFormVariant}
                ownedFurniture={data.furniture}"""

content = re.sub(r'              <CaterpillarRoom \n                onFeed=\{handleFeed\} \n                stage=\{data\.stage\} \n                formVariant=\{data\.formVariant \|\| currentFormVariant\}\n                ownedFurniture=\{data\.furniture\}', main_room_patch, content)

with open('components/Dashboard.tsx', 'w') as f:
    f.write(content)
