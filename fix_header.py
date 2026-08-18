import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="bg-stone-800 hover:bg-stone-700 text-white p-2 rounded-xl transition shadow-xs cursor-pointer"
              title="観察記録を共有"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger & Quick Save Buttons */}
          <div className="flex md:hidden items-center gap-1.5">"""

new_target = """            {/* Announcements Button (Desktop) */}
            <button
              onClick={handleOpenAnnouncements}
              className="relative bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 p-2 rounded-xl transition shadow-xs cursor-pointer"
              title="お知らせ"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadAnnouncements && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="bg-stone-800 hover:bg-stone-700 text-white p-2 rounded-xl transition shadow-xs cursor-pointer"
              title="観察記録を共有"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger & Quick Save Buttons */}
          <div className="flex md:hidden items-center gap-1.5">"""
content = content.replace(target, new_target)

target2 = """            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 transition cursor-pointer"
              aria-label="メニューを開く"
            >
              <Menu className="w-5 h-5" />
            </button>"""

new_target2 = """            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 transition cursor-pointer"
              aria-label="メニューを開く"
            >
              <Menu className="w-5 h-5" />
              {hasUnreadAnnouncements && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>"""
content = content.replace(target2, new_target2)

with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

