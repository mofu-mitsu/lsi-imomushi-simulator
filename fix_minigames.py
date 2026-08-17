import re

with open('components/MiniGames.tsx', 'r') as f:
    content = f.read()

# Make expGain = 0
content = re.sub(r'const expGain = Math\.max\(1, Math\.round\(score \* expMultiplier\)\);', 'const expGain = 0;', content)
# Remove exp from the UI message if possible
content = re.sub(r'（\+\{lastGameResult\.exp\} EXP, \+\{lastGameResult\.points\} TP）', '（+{lastGameResult.points} TP）', content)
content = re.sub(r'獲得コイン: \+\$\{lastGameResult\.points\}TP 獲得！', '獲得コイン: +${lastGameResult.points}TP', content)

with open('components/MiniGames.tsx', 'w') as f:
    f.write(content)
