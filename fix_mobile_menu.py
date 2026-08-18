import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleManualSave();
                    }}"""

new_target = """                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleOpenAnnouncements();
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 text-xs font-bold text-left cursor-pointer transition relative"
                  >
                    <Bell className="w-4 h-4 text-emerald-700" />
                    <span>🔔 運営からのお知らせ</span>
                    {hasUnreadAnnouncements && (
                      <span className="absolute right-3 w-2 h-2 rounded-full bg-red-500"></span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleManualSave();
                    }}"""

content = content.replace(target, new_target)

with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

