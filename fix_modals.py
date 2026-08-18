import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """      {/* -------------------------------------------------------------
          MODAL: ENCYCLOPEDIA (形態図鑑)
      ------------------------------------------------------------- */}"""

new_target = """      {/* -------------------------------------------------------------
          MODAL: ANNOUNCEMENTS (お知らせ)
      ------------------------------------------------------------- */}
      <AnimatePresence>
        {showAnnouncementsModal && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-stone-300 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b-2 border-stone-100 pb-3">
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-700" />
                  <span>運営からのお知らせ</span>
                </h3>
                <button 
                  onClick={() => setShowAnnouncementsModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer transition active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {announcements.length === 0 ? (
                  <p className="text-sm text-stone-500 font-bold text-center py-8">現在お知らせはありません。</p>
                ) : (
                  announcements.map((ann, idx) => (
                    <div key={ann.id} className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {ann.date}
                        </span>
                        {idx === 0 && ann.id !== lastReadAnnouncementId && (
                          <span className="text-[10px] font-black text-red-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            NEW
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-sm text-stone-900 leading-snug">{ann.title}</h4>
                      <p className="text-xs text-stone-600 font-medium whitespace-pre-wrap leading-relaxed mt-1">
                        {ann.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setShowAnnouncementsModal(false)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-white font-black py-3.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer mt-2"
              >
                閉じる
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------
          MODAL: ENCYCLOPEDIA (形態図鑑)
      ------------------------------------------------------------- */}"""
content = content.replace(target, new_target)

with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

