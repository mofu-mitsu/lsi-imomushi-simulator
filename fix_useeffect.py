import re

with open("components/Dashboard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add useEffect to load announcements
target = "  // Mount logic: Load from LocalStorage first, then GAS"
new_target = """  // Load announcements
  useEffect(() => {
    if (!mounted) return;
    const fetchAnnouncements = async () => {
      const savedRead = localStorage.getItem('lsi_last_read_announcement');
      if (savedRead) setLastReadAnnouncementId(savedRead);
      
      const res = await fetchAnnouncementsFromGas(DEFAULT_GAS_URL);
      if (res.success && res.data) {
        setAnnouncements(res.data);
      }
    };
    fetchAnnouncements();
  }, [mounted]);

  // Mount logic: Load from LocalStorage first, then GAS"""

content = content.replace(target, new_target)
with open("components/Dashboard.tsx", "w", encoding="utf-8") as f:
    f.write(content)

