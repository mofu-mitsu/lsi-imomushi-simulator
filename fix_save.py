import re

with open("GAS.txt", "r", encoding="utf-8") as f:
    content = f.read()

target = """      const rowData = [
        targetUid,                                           // 1: UID
        data.ownerName || '飼育員',                          // 2: 飼育員名
        data.selfType || '未設定',                           // 3: 自認タイプ
        data.id || '000001',                                 // 4: 個体ID
        data.name || 'LSI芋虫（幼虫）',                      // 5: 名前・肩書
        data.stage !== undefined ? data.stage : 0,           // 6: 進化段階
        data.exp !== undefined ? data.exp : 0,               // 7: 獲得EXP
        data.points !== undefined ? data.points : 0,         // 8: 統制ポイント
        JSON.stringify(data.furniture || []),                // 9: 所有家具
        JSON.stringify(data.discoveredStages || []),         // 10: アンロック図鑑
        data.sprayCount !== undefined ? data.sprayCount : 0, // 11: 防虫スプレー所持数
        data.daycareUntil || '',                             // 12: 保育園保護期限
        JSON.stringify(data.foodStats || { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }), // 13: エサ摂取統計
        data.formVariant || 'crystal',                       // 14: 形態バリアント
        data.darlingIncident ? true : false,                 // 15: ダーリンインシデント
        data.squashCount !== undefined ? data.squashCount : 0, // 16: 潰された回数
        data.lastFedAt || nowStr,                            // 17: 最終給餌日時
        data.lastMessageAt || nowStr,                        // 18: 最終交信日時
        nowStr                                               // 19: 最終更新日時
      ];"""

new_target = """      const rowData = [
        targetUid,                                           // 1: UID
        data.ownerName || '飼育員',                          // 2: 飼育員名
        data.selfType || '未設定',                           // 3: 自認タイプ
        data.id || '000001',                                 // 4: 個体ID
        data.name || 'LSI芋虫（幼虫）',                      // 5: 名前・肩書
        data.stage !== undefined ? data.stage : 0,           // 6: 進化段階
        data.exp !== undefined ? data.exp : 0,               // 7: 獲得EXP
        data.points !== undefined ? data.points : 0,         // 8: 統制ポイント
        JSON.stringify(data.furniture || []),                // 9: 所有家具
        JSON.stringify(data.equippedFurniture || data.furniture || []), // 10: 設置中家具
        JSON.stringify(data.discoveredStages || []),         // 11: アンロック図鑑
        data.sprayCount !== undefined ? data.sprayCount : 0, // 12: 防虫スプレー所持数
        data.daycareUntil || '',                             // 13: 保育園保護期限
        JSON.stringify(data.foodStats || { cabbage: 0, apple: 0, glucose: 0, sugar: 0, twig: 0 }), // 14: エサ摂取統計
        data.formVariant || 'crystal',                       // 15: 形態バリアント
        data.darlingIncident ? true : false,                 // 16: ダーリンインシデント
        data.squashCount !== undefined ? data.squashCount : 0, // 17: 潰された回数
        data.lastFedAt || nowStr,                            // 18: 最終給餌日時
        data.lastMessageAt || nowStr,                        // 19: 最終交信日時
        nowStr                                               // 20: 最終更新日時
      ];"""

content = content.replace(target, new_target)
with open("GAS.txt", "w", encoding="utf-8") as f:
    f.write(content)

