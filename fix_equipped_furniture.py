import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """            points: parsed.points !== undefined ? parsed.points : 150,
            furniture: parsed.furniture || [],
            discoveredStages: discovered,"""

new_target = """            points: parsed.points !== undefined ? parsed.points : 150,
            furniture: parsed.furniture || [],
            equippedFurniture: parsed.equippedFurniture || parsed.furniture || [],
            discoveredStages: discovered,"""

content = content.replace(target, new_target)

target2 = """              uid: user.uid,
              ownerName: fetched.ownerName || (user.displayName || '飼育員'),
              gasWebAppUrl: DEFAULT_GAS_URL,"""

# We need to make sure fetched.equippedFurniture is loaded during sync
# Wait, let's just see how sync works
