import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = "  const [currentUser, setCurrentUser] = useState<User | null>(null);"
new_target = """  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [lastReadAnnouncementId, setLastReadAnnouncementId] = useState<string | null>(null);"""

content = content.replace(target, new_target)
with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

