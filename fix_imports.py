import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("RefreshCw\n}", "RefreshCw,\n  Bell\n}")
content = content.replace("  getOrCreateGuestUid\n}", "  getOrCreateGuestUid,\n  Announcement,\n  fetchAnnouncementsFromGas\n}")

with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

