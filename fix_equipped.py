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

# We also need to fix the setSyncStatus section where it syncs fetched
target2 = """              uid: user.uid,
              ownerName: fetched.ownerName || (user.displayName || '飼育員'),
              gasWebAppUrl: DEFAULT_GAS_URL,
              sprayCount: fetched.sprayCount !== undefined ? fetched.sprayCount : (prev.sprayCount || 0),"""

new_target2 = """              uid: user.uid,
              ownerName: fetched.ownerName || (user.displayName || '飼育員'),
              gasWebAppUrl: DEFAULT_GAS_URL,
              furniture: fetched.furniture || prev.furniture || [],
              equippedFurniture: fetched.equippedFurniture || fetched.furniture || prev.equippedFurniture || [],
              sprayCount: fetched.sprayCount !== undefined ? fetched.sprayCount : (prev.sprayCount || 0),"""
content = content.replace(target2, new_target2)

with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

