import re

with open("GAS.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Modify headers array
old_headers = """  const headers = [
    'UID (アカウント識別子)', 
    '飼育員名', 
    '自認タイプ', 
    '個体ID', 
    '名前・肩書', 
    '進化段階', 
    '獲得EXP', 
    '統制ポイント', 
    '所有家具 (JSON)', 
    'アンロック図鑑 (JSON)',
    '防虫スプレー回数',
    '保育園保護期限',
    'エサ摂取統計 (JSON)',
    '形態バリアント',
    'ダーリンインシデント',
    '潰された回数',
    '最終給餌日時', 
    '最終交信日時', 
    '最終更新日時'
  ];"""

new_headers = """  const headers = [
    'UID (アカウント識別子)', 
    '飼育員名', 
    '自認タイプ', 
    '個体ID', 
    '名前・肩書', 
    '進化段階', 
    '獲得EXP', 
    '統制ポイント', 
    '所有家具 (JSON)', 
    '設置中家具 (JSON)',
    'アンロック図鑑 (JSON)',
    '防虫スプレー回数',
    '保育園保護期限',
    'エサ摂取統計 (JSON)',
    '形態バリアント',
    'ダーリンインシデント',
    '潰された回数',
    '最終給餌日時', 
    '最終交信日時', 
    '最終更新日時'
  ];"""
content = content.replace(old_headers, new_headers)

# Let's fix parseRowToUserObject
old_parse = """function parseRowToUserObject(row) {
  return {
    uid: String(row[0] || ''),
    ownerName: String(row[1] || '飼育員'),
    selfType: String(row[2] || '未設定'),
    id: String(row[3] || '000001'),
    name: String(row[4] || 'LSI芋虫（幼虫）'),
    stage: Number(row[5]) || 0,
    exp: Number(row[6]) || 0,
    points: Number(row[7]) || 0,
    furniture: safeParseJson(row[8], []),
    discoveredStages: safeParseJson(row[9], ['LSI芋虫（幼虫）']),
    sprayCount: Number(row[10]) || 0,
    daycareUntil: String(row[11] || ''),
    foodStats: safeParseJson(row[12], { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }),
    formVariant: String(row[13] || 'crystal'),
    darlingIncident: row[14] === true || String(row[14]).toLowerCase() === 'true',
    squashCount: Number(row[15]) || 0,
    lastFedAt: String(row[16] || ''),
    lastMessageAt: String(row[17] || '')
  };
}"""

new_parse = """function parseRowToUserObject(row) {
  // Check if we are reading a row with old format or new format (20 columns vs 19)
  // If row[9] looks like an array of strings, it might be discoveredStages or equippedFurniture.
  // Actually, we can check row length or just map carefully.
  // To be safe, if we upgraded the sheet, row length will be 20.
  const isUpgraded = row.length >= 20;
  
  if (isUpgraded) {
    return {
      uid: String(row[0] || ''),
      ownerName: String(row[1] || '飼育員'),
      selfType: String(row[2] || '未設定'),
      id: String(row[3] || '000001'),
      name: String(row[4] || 'LSI芋虫（幼虫）'),
      stage: Number(row[5]) || 0,
      exp: Number(row[6]) || 0,
      points: Number(row[7]) || 0,
      furniture: safeParseJson(row[8], []),
      equippedFurniture: safeParseJson(row[9], null) || safeParseJson(row[8], []),
      discoveredStages: safeParseJson(row[10], ['LSI芋虫（幼虫）']),
      sprayCount: Number(row[11]) || 0,
      daycareUntil: String(row[12] || ''),
      foodStats: safeParseJson(row[13], { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }),
      formVariant: String(row[14] || 'crystal'),
      darlingIncident: row[15] === true || String(row[15]).toLowerCase() === 'true',
      squashCount: Number(row[16]) || 0,
      lastFedAt: String(row[17] || ''),
      lastMessageAt: String(row[18] || '')
    };
  } else {
    return {
      uid: String(row[0] || ''),
      ownerName: String(row[1] || '飼育員'),
      selfType: String(row[2] || '未設定'),
      id: String(row[3] || '000001'),
      name: String(row[4] || 'LSI芋虫（幼虫）'),
      stage: Number(row[5]) || 0,
      exp: Number(row[6]) || 0,
      points: Number(row[7]) || 0,
      furniture: safeParseJson(row[8], []),
      equippedFurniture: safeParseJson(row[8], []),
      discoveredStages: safeParseJson(row[9], ['LSI芋虫（幼虫）']),
      sprayCount: Number(row[10]) || 0,
      daycareUntil: String(row[11] || ''),
      foodStats: safeParseJson(row[12], { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }),
      formVariant: String(row[13] || 'crystal'),
      darlingIncident: row[14] === true || String(row[14]).toLowerCase() === 'true',
      squashCount: Number(row[15]) || 0,
      lastFedAt: String(row[16] || ''),
      lastMessageAt: String(row[17] || '')
    };
  }
}"""
content = content.replace(old_parse, new_parse)

# Fix saveStatus
old_save = """        const newRow = [
          targetUid,
          data.ownerName || '飼育員',
          data.selfType || '未設定',
          data.id || '000001',
          data.name || 'LSI芋虫',
          data.stage || 0,
          data.exp || 0,
          data.points || 0,
          JSON.stringify(data.furniture || []),
          JSON.stringify(data.discoveredStages || []),
          data.sprayCount || 0,
          data.daycareUntil || '',
          JSON.stringify(data.foodStats || {}),
          data.formVariant || 'crystal',
          data.darlingIncident || false,
          data.squashCount || 0,
          data.lastFedAt || nowStr,
          data.lastMessageAt || nowStr,
          nowStr
        ];"""

new_save = """        const newRow = [
          targetUid,
          data.ownerName || '飼育員',
          data.selfType || '未設定',
          data.id || '000001',
          data.name || 'LSI芋虫',
          data.stage || 0,
          data.exp || 0,
          data.points || 0,
          JSON.stringify(data.furniture || []),
          JSON.stringify(data.equippedFurniture || data.furniture || []),
          JSON.stringify(data.discoveredStages || []),
          data.sprayCount || 0,
          data.daycareUntil || '',
          JSON.stringify(data.foodStats || {}),
          data.formVariant || 'crystal',
          data.darlingIncident || false,
          data.squashCount || 0,
          data.lastFedAt || nowStr,
          data.lastMessageAt || nowStr,
          nowStr
        ];"""
content = content.replace(old_save, new_save)

# Add getAnnouncements in doGet
old_doget = """      // If UID not found, return null so the frontend knows it's a new user
      return createJsonResponse({ success: true, data: null });
    }
    
    return createJsonResponse({ success: true, message: 'LSI Caterpillar GAS Backend (v3) is running.' });"""

new_doget = """      // If UID not found, return null so the frontend knows it's a new user
      return createJsonResponse({ success: true, data: null });
    }
    
    if (action === 'getAnnouncements') {
      const sheet = ss.getSheetByName('お知らせ');
      if (!sheet) {
        return createJsonResponse({ success: true, data: [] });
      }
      const data = sheet.getDataRange().getValues();
      const announcements = [];
      // skip header row 0
      for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
          announcements.push({
            id: String(data[i][0]),
            date: String(data[i][1]),
            title: String(data[i][2]),
            content: String(data[i][3])
          });
        }
      }
      return createJsonResponse({ success: true, data: announcements.reverse() }); // newest first
    }
    
    return createJsonResponse({ success: true, message: 'LSI Caterpillar GAS Backend (v4) is running.' });"""
content = content.replace(old_doget, new_doget)

# Add sheet init for お知らせ
old_init = """    statusSheet.getRange(1, 1, 1, headers.length).setBackground('#d1fae5').setFontWeight('bold');
  } else {
    // Check if headers need updating to new 19 columns
    const currentCols = statusSheet.getLastColumn();
    if (currentCols < headers.length) {
      statusSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      statusSheet.getRange(1, 1, 1, headers.length).setBackground('#d1fae5').setFontWeight('bold');
    }
  }
  """

new_init = """    statusSheet.getRange(1, 1, 1, headers.length).setBackground('#d1fae5').setFontWeight('bold');
  } else {
    const currentCols = statusSheet.getLastColumn();
    // Upgrade existing data to 20 columns if they only have 19 or less
    if (currentCols < headers.length) {
      // First, get all data
      const data = statusSheet.getDataRange().getValues();
      
      // Update header
      statusSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      statusSheet.getRange(1, 1, 1, headers.length).setBackground('#d1fae5').setFontWeight('bold');
      
      // We must insert a blank column for "設置中家具" at column 10 (index 9) for all existing rows 
      // if they only had 19 columns. But wait, if they have less columns, their data index is shifted!
      // To be safe, we will just rely on parseRowToUserObject checking row length on read, and saveStatus will overwrite with 20 columns.
      // But it's better to just insert the missing column so formatting aligns.
      if (currentCols === 19) {
        statusSheet.insertColumnBefore(10);
        statusSheet.getRange(1, 10).setValue('設置中家具 (JSON)');
      }
    }
  }
  
  let noticeSheet = ss.getSheetByName('お知らせ');
  if (!noticeSheet) {
    noticeSheet = ss.insertSheet('お知らせ');
    const noticeHeaders = ['ID', '日付', 'タイトル', '本文(改行可)'];
    noticeSheet.getRange(1, 1, 1, noticeHeaders.length).setValues([noticeHeaders]);
    noticeSheet.getRange(1, 1, 1, noticeHeaders.length).setBackground('#fde68a').setFontWeight('bold');
    
    // Add sample announcement
    noticeSheet.appendRow(['msg_001', Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd'), 'LSI規律お知らせ機能追加', 'お知らせをスプレッドシートから配信できるようになりました。']);
  }"""
content = content.replace(old_init, new_init)

with open("GAS.txt", "w", encoding="utf-8") as f:
    f.write(content)

