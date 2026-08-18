import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """            name: stageInfo.name,
            stage: stageIdx,
            formVariant: formVariant,
            gasWebAppUrl: DEFAULT_GAS_URL,
            uid: parsed.uid || guestUid,
            points: parsed.points !== undefined ? parsed.points : 150,
            furniture: parsed.furniture || [],
            equippedFurniture: parsed.equippedFurniture || parsed.furniture || [],
            discoveredStages: discovered,"""

new_target = """            name: stageInfo.name,
            stage: stageIdx,
            formVariant: formVariant,
            gasWebAppUrl: DEFAULT_GAS_URL,
            uid: parsed.uid || guestUid,
            points: parsed.points !== undefined ? parsed.points : 150,
            furniture: parsed.furniture || [],
            equippedFurniture: parsed.equippedFurniture || parsed.furniture || [],
            discoveredStages: discovered,"""

# Let's replace the one without equippedFurniture since we already added it in the previous script?
# Actually, I used `fix_equipped_furniture.py` but `...parsed` comes BEFORE. 
# So `equippedFurniture` is added AFTER `...parsed`, which will correctly overwrite `[]` with `parsed.furniture` if `parsed.equippedFurniture` is missing.
