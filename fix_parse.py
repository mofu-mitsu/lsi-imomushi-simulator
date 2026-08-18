import re

with open("GAS.txt", "r", encoding="utf-8") as f:
    content = f.read()

target = """function parseRowToUserObject(row) {
  return {
    uid: row[0],
    ownerName: row[1],
    selfType: row[2],
    id: row[3],
    name: row[4],
    stage: Number(row[5]) || 0,
    exp: Number(row[6]) || 0,
    points: Number(row[7]) || 0,
    furniture: safeJsonParse(row[8], []),
    discoveredStages: safeJsonParse(row[9], ['LSI芋虫（幼虫）']),
    sprayCount: Number(row[10]) || 0,
    daycareUntil: row[11] || '',
    foodStats: safeJsonParse(row[12], { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }),
    formVariant: row[13] || 'crystal',
    darlingIncident: row[14] === true || String(row[14]) === 'true',
    squashCount: Number(row[15]) || 0,
    lastFedAt: row[16] || '',
    lastMessageAt: row[17] || ''
  };
}"""

new_target = """function parseRowToUserObject(row) {
  const isUpgraded = row.length >= 20;
  
  if (isUpgraded) {
    return {
      uid: row[0],
      ownerName: row[1],
      selfType: row[2],
      id: row[3],
      name: row[4],
      stage: Number(row[5]) || 0,
      exp: Number(row[6]) || 0,
      points: Number(row[7]) || 0,
      furniture: safeJsonParse(row[8], []),
      equippedFurniture: safeJsonParse(row[9], null) || safeJsonParse(row[8], []),
      discoveredStages: safeJsonParse(row[10], ['LSI芋虫（幼虫）']),
      sprayCount: Number(row[11]) || 0,
      daycareUntil: row[12] || '',
      foodStats: safeJsonParse(row[13], { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }),
      formVariant: row[14] || 'crystal',
      darlingIncident: row[15] === true || String(row[15]) === 'true',
      squashCount: Number(row[16]) || 0,
      lastFedAt: row[17] || '',
      lastMessageAt: row[18] || ''
    };
  } else {
    return {
      uid: row[0],
      ownerName: row[1],
      selfType: row[2],
      id: row[3],
      name: row[4],
      stage: Number(row[5]) || 0,
      exp: Number(row[6]) || 0,
      points: Number(row[7]) || 0,
      furniture: safeJsonParse(row[8], []),
      equippedFurniture: safeJsonParse(row[8], []),
      discoveredStages: safeJsonParse(row[9], ['LSI芋虫（幼虫）']),
      sprayCount: Number(row[10]) || 0,
      daycareUntil: row[11] || '',
      foodStats: safeJsonParse(row[12], { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }),
      formVariant: row[13] || 'crystal',
      darlingIncident: row[14] === true || String(row[14]) === 'true',
      squashCount: Number(row[15]) || 0,
      lastFedAt: row[16] || '',
      lastMessageAt: row[17] || ''
    };
  }
}"""

content = content.replace(target, new_target)
with open("GAS.txt", "w", encoding="utf-8") as f:
    f.write(content)

