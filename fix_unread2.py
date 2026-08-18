import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = """  const [showNotReadyModal, setShowNotReadyModal] = useState(false);"""
new_target = """  const [showNotReadyModal, setShowNotReadyModal] = useState(false);

  const hasUnreadAnnouncements = announcements.length > 0 && announcements[0].id !== lastReadAnnouncementId;
  const handleOpenAnnouncements = () => {
    setShowAnnouncementsModal(true);
    if (announcements.length > 0) {
      setLastReadAnnouncementId(announcements[0].id);
      localStorage.setItem('lsi_last_read_announcement', announcements[0].id);
    }
  };"""

content = content.replace(target, new_target)
with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

