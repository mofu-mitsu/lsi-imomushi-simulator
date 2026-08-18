import re

with open("components/CaterpillarRoom.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add ref
content = content.replace(
    "const [catPos, setCatPos] = useState<Position>({ x: 50, y: 50 });",
    "const [catPos, setCatPos] = useState<Position>({ x: 50, y: 50 });\n  const catPosRef = useRef<Position>({ x: 50, y: 50 });"
)

# Replace setCatPos everywhere we need to sync ref (if we do setCatPos({ x: 45, y: 50 }))
# Wait, let's just make the interval read from `setCatPos(prev => { ... return newPos })` but do side effects inside `setTimeout(..., 0)` so it doesn't trigger warnings!
# That's the easiest fix for the React warning without full refactor!
# We just need to wrap all `set...()` inside `setTimeout(() => { ... }, 0)` inside the prev updater.
